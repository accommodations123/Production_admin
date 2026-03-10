import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  TableContainer,
  InputBase,
  IconButton,
  CircularProgress,
  Backdrop,
  Container,
  CssBaseline,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  Chip,
  Card,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tab,
  Tabs,
  Avatar,
  Tooltip,
  alpha,
  Skeleton,
  Fab,
  Zoom,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Stack,
} from "@mui/material";
import {
  Search,
  Close,
  Refresh,
  FilterList,
  CalendarToday,
  FlightTakeoff,
  FlightLand,
  AirlineSeatReclineNormal,
  Block,
  Cancel,
  Info,
  ErrorOutline,
  People,
  Schedule,
  CheckCircle,
  Flight,
} from "@mui/icons-material";

// Assuming these are in your project directory
import TripDetailsModal from "./TripDetailsModal";
import TravelDashboard from "./TravelDashboard";

/* =====================
   API CONFIG
===================== */
const BASE_URL = "https://api.nextkinlife.live";
const TOKEN = localStorage.getItem("admin-auth");

/* =====================
   MAIN COMPONENT
===================== */
export default function TravelAdmin() {
  const [trips, setTrips] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [viewTrip, setViewTrip] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [tabValue, setTabValue] = useState(0);

  // State for Confirmation Dialog
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: null,
    title: '',
    message: ''
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  /* =====================
     FETCH APIs
  ===================== */
  const fetchTrips = async () => {
    try {
      const res = await fetch(`${BASE_URL}/travel/admin/trips`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      const json = await res.json();
      setTrips(json.results || []);
      return json.results || [];
    } catch (err) {
      console.error("Error fetching trips:", err);
      return [];
    }
  };

  const fetchMatches = async () => {
    try {
      const res = await fetch(`${BASE_URL}/travel/matches`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      const json = await res.json();
      setMatches(json.results || []);
      return json.results || [];
    } catch (err) {
      console.error("Error fetching matches:", err);
      return [];
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [tripsData, matchesData] = await Promise.all([fetchTrips(), fetchMatches()]);

      setStats({
        totalTrips: tripsData.length,
        activeTrips: tripsData.filter(t => t.status === 'active').length,
        completedTrips: tripsData.filter(t => t.status === 'completed').length,
        totalMatches: matchesData.length,
      });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to refresh data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const [stats, setStats] = useState({
    totalTrips: 0,
    activeTrips: 0,
    completedTrips: 0,
    totalMatches: 0,
  });

  useEffect(() => {
    fetchAll();
  }, []);

  /* =====================
     ACTION HANDLERS
  ===================== */

  const handleAction = async (url, method, successMsg) => {
    setLoading(true);
    try {
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${TOKEN}` }
      });
      const json = await res.json();

      if (res.ok) {
        setSnackbar({ open: true, message: successMsg, severity: 'success' });
        fetchAll(); // Refresh to see cascading updates (e.g. cancelled matches)
      } else {
        throw new Error(json.message || 'Action failed');
      }
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setLoading(false);
      setConfirmDialog({ ...confirmDialog, open: false });
    }
  };

  const initiateCancelTrip = (tripId) => {
    setConfirmDialog({
      open: true,
      action: () => handleAction(`${BASE_URL}/travel/admin/trips/${tripId}/cancel`, 'PUT', 'Trip and related matches cancelled successfully'),
      title: 'Cancel Trip',
      message: 'Are you sure? This will cancel the trip and ALL associated matches.'
    });
  };

  const initiateBlockHost = (hostId) => {
    setConfirmDialog({
      open: true,
      action: () => handleAction(`${BASE_URL}/travel/admin/hosts/${hostId}/block`, 'PUT', 'Host blocked. All trips and matches cancelled.'),
      title: 'Block Host',
      message: 'WARNING: This will block the host and CANCEL ALL their trips and matches. This action is irreversible.'
    });
  };

  const initiateCancelMatch = (matchId) => {
    setConfirmDialog({
      open: true,
      action: () => handleAction(`${BASE_URL}/travel/admin/matches/${matchId}/cancel`, 'PUT', 'Match cancelled successfully'),
      title: 'Cancel Match',
      message: 'Are you sure you want to cancel this match?'
    });
  };

  /* =====================
     SEARCH & FILTER LOGIC
  ===================== */

  // 1. Filter Trips based on Search + Status Filter + Tab Value
  const filteredTrips = useMemo(() => {
    return trips.filter((t) => {
      const text =
        `${t.from_city} ${t.to_city} ${t.airline} ${t.host?.full_name}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());

      // Logic: If specific tabs are selected, they override the dropdown filter
      let matchesStatus = true;
      if (tabValue === 1) { // Active Tab
        matchesStatus = t.status === 'active';
      } else if (tabValue === 2) { // Completed Tab
        matchesStatus = t.status === 'completed';
      } else { // All Trips Tab (or default)
        matchesStatus = statusFilter === "all" || t.status === statusFilter;
      }

      return matchesSearch && matchesStatus;
    });
  }, [trips, search, statusFilter, tabValue]);

  // 2. Filter Matches based on Search (searching via linked Trip info)
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      // Find the trip associated with this match to enable searching
      const trip = trips.find(t => t.id === m.trip_id);
      if (!trip) return false;

      const text = `${trip.from_city} ${trip.to_city} ${trip.airline}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [matches, trips, search]);

  const matchCountByTrip = useMemo(() => {
    const map = {};
    matches.forEach((m) => {
      map[m.trip_id] = (map[m.trip_id] || 0) + 1;
    });
    return map;
  }, [matches]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Optional: Reset search or filter when changing tabs
    // setSearch(''); 
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ bgcolor: "#f5f7fa", minHeight: "100vh" }}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: 4 }}>

        {/* ================= DASHBOARD STATS ================= */}
        <TravelDashboard
          stats={stats}
          trips={trips}
          matches={matches}
        />

        {/* ================= TABS & TABLE ================= */}
        <Card elevation={0} sx={{ borderRadius: 3, mb: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
              sx={{ px: 2 }}
            >
              <Tab label="All Trips" icon={<Flight sx={{ fontSize: 18 }} />} iconPosition="start" />
              <Tab label="Active Trips" icon={<Schedule sx={{ fontSize: 18 }} />} iconPosition="start" />
              <Tab label="Completed Trips" icon={<CheckCircle sx={{ fontSize: 18 }} />} iconPosition="start" />
              <Tab label="Recent Matches" icon={<People sx={{ fontSize: 18 }} />} iconPosition="start" />
            </Tabs>
          </Box>

          <Box sx={{ p: 3 }}>
            {/* ================= SEARCH & FILTER ================= */}
            <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ display: "flex", alignItems: "center", px: 2, py: 1.5, boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)', borderRadius: 2 }}>
                  <Search sx={{ fontSize: 18, color: '#888' }} />
                  <InputBase
                    sx={{ ml: 1, flex: 1 }}
                    placeholder={tabValue === 3 ? "Search matches by route or airline..." : "Search by city, airline, traveler..."}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <IconButton onClick={() => setSearch("")} size="small">
                      <Close sx={{ fontSize: 16, color: '#888' }} />
                    </IconButton>
                  )}
                </Paper>
              </Grid>

              {/* Only show Status Filter for Trip tabs, not Matches tab */}
              {tabValue !== 3 && (
                <Grid item xs={12} md={6}>
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }} disabled={tabValue === 1 || tabValue === 2}>
                      <InputLabel id="status-filter-label">Status</InputLabel>
                      <Select
                        labelId="status-filter-label"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        label="Status"
                        startAdornment={<FilterList sx={{ fontSize: 16, mr: 1 }} />}
                      >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                      </Select>
                    </FormControl>
                    <Button
                      startIcon={<Refresh />}
                      variant="outlined"
                      onClick={fetchAll}
                      sx={{ borderRadius: 2 }}
                    >
                      Refresh
                    </Button>
                  </Stack>
                </Grid>
              )}

              {tabValue === 3 && (
                <Grid item xs={12} md={6}>
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button
                      startIcon={<Refresh />}
                      variant="outlined"
                      onClick={fetchAll}
                      sx={{ borderRadius: 2 }}
                    >
                      Refresh
                    </Button>
                  </Stack>
                </Grid>
              )}
            </Grid>

            {/* ================= TABLE ================= */}
            <TableContainer>
              <Table>
                {/* HEADERS */}
                <TableHead>
                  {tabValue === 3 ? (
                    // MATCHES TABLE HEADERS
                    <TableRow>
                      <TableCell>Match ID</TableCell>
                      <TableCell>Trip Route</TableCell>
                      <TableCell>Flight</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  ) : (
                    // TRIPS TABLE HEADERS
                    <TableRow>
                      <TableCell>Traveler</TableCell>
                      <TableCell>Route</TableCell>
                      <TableCell>Flight</TableCell>
                      <TableCell>Departure</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Matches</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  )}
                </TableHead>

                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        {/* Render skeletons based on column count to keep alignment roughly */}
                        <TableCell><Skeleton animation="wave" /></TableCell>
                        <TableCell><Skeleton animation="wave" /></TableCell>
                        <TableCell><Skeleton animation="wave" /></TableCell>
                        <TableCell><Skeleton animation="wave" /></TableCell>
                        <TableCell><Skeleton animation="wave" /></TableCell>
                        <TableCell><Skeleton animation="wave" /></TableCell>
                        {tabValue !== 3 && <TableCell><Skeleton animation="wave" /></TableCell>}
                        {tabValue !== 3 && <TableCell><Skeleton animation="wave" /></TableCell>}
                      </TableRow>
                    ))
                  ) : tabValue === 3 ? (
                    // RENDER MATCHES ROWS
                    filteredMatches.map((m) => {
                      const trip = trips.find(t => t.id === m.trip_id);
                      if (!trip) return null;
                      return (
                        <TableRow key={m.id} hover sx={{ '&:hover': { bgcolor: alpha('#1976d2', 0.04) } }}>
                          <TableCell>
                            <Typography variant="body2" fontFamily="monospace">#{m.id}</Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <FlightTakeoff sx={{ fontSize: 16, color: '#888', mr: 0.5 }} />
                                  <Typography variant="body2" fontWeight={500}>
                                    {trip.from_city}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                  <FlightLand sx={{ fontSize: 16, color: '#888', mr: 0.5 }} />
                                  <Typography variant="body2">
                                    {trip.to_city}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{trip.airline} {trip.flight_number}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{trip.travel_date}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={m.status ? m.status.toUpperCase() : 'UNKNOWN'}
                              color={m.status === 'confirmed' ? 'success' : m.status === 'pending' ? 'warning' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Cancel Match">
                              <IconButton
                                size="small"
                                onClick={() => initiateCancelMatch(m.id)}
                                color="error"
                              >
                                <Cancel sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    // RENDER TRIPS ROWS
                    filteredTrips.map((t) => (
                      <TableRow key={t.id} hover sx={{ '&:hover': { bgcolor: alpha('#1976d2', 0.04) } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2, width: 36, height: 36, bgcolor: '#1976d2' }}>
                              {t.host?.full_name?.charAt(0) || 'U'}
                            </Avatar>
                            <Box>
                              <Typography fontWeight={600}>
                                {t.host?.full_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {t.host?.User?.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <FlightTakeoff sx={{ fontSize: 16, color: '#888', mr: 0.5 }} />
                                <Typography variant="body2" fontWeight={500}>
                                  {t.from_city}, {t.from_country}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <FlightLand sx={{ fontSize: 16, color: '#888', mr: 0.5 }} />
                                <Typography variant="body2">
                                  {t.to_city}, {t.to_country}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AirlineSeatReclineNormal sx={{ fontSize: 16, color: '#888', mr: 0.5 }} />
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {t.airline}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {t.flight_number}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CalendarToday sx={{ fontSize: 16, color: '#888', mr: 0.5 }} />
                            <Box>
                              <Typography variant="body2">
                                {t.travel_date}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {t.departure_time}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={t.status ? t.status.toUpperCase() : 'UNKNOWN'}
                            color={
                              t.status === 'active' ? 'success' :
                                t.status === 'completed' ? 'default' :
                                  t.status === 'cancelled' ? 'error' :
                                    'warning'
                            }
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={matchCountByTrip[t.id] || 0}
                            color={matchCountByTrip[t.id] > 0 ? "primary" : "default"}
                            size="small"
                            variant="outlined"
                            icon={<People sx={{ fontSize: 14 }} />}
                          />
                        </TableCell>

                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">

                            {/* View Details */}
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => setViewTrip(t)}
                                color="primary"
                              >
                                <Info sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>

                            {/* Cancel Trip (Reject) */}
                            {t.status !== 'cancelled' && t.status !== 'completed' && (
                              <Tooltip title="Cancel Trip">
                                <IconButton
                                  size="small"
                                  onClick={() => initiateCancelTrip(t.id)}
                                  color="error"
                                >
                                  <Cancel sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>
                            )}

                            {/* Block Host */}
                            <Tooltip title="Block Host">
                              <IconButton
                                size="small"
                                onClick={() => initiateBlockHost(t.host?.id)}
                                sx={{ color: '#d32f2f' }}
                              >
                                <Block sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {!loading && ((tabValue === 3 && !filteredMatches.length) || (tabValue !== 3 && !filteredTrips.length)) && (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <ErrorOutline sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                  <Typography color="text.secondary">
                    {tabValue === 3 ? "No matches found." : "No trips found matching your criteria"}
                  </Typography>
                  <Button variant="outlined" sx={{ mt: 2 }} onClick={() => { setSearch(''); setStatusFilter('all'); }}>
                    Clear filters
                  </Button>
                </Box>
              )}
            </TableContainer>
          </Box>
        </Card>
      </Container>

      {/* ================= TRIP DETAILS MODAL ================= */}
      <TripDetailsModal
        open={Boolean(viewTrip)}
        trip={viewTrip}
        matches={matches}
        onCancelMatch={(id) => initiateCancelMatch(id)}
        onClose={() => setViewTrip(null)}
      />

      {/* ================= CONFIRMATION DIALOG ================= */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.secondary">
            {confirmDialog.message}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>Disagree</Button>
          <Button onClick={confirmDialog.action} color={confirmDialog.title.includes('Cancel') ? 'error' : 'warning'} autoFocus variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================= FLOATING ACTION BUTTON ================= */}
      <Zoom in={true} timeout={300} style={{ transitionDelay: '300ms' }}>
        <Fab
          color="primary"
          aria-label="refresh"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={fetchAll}
        >
          <Refresh />
        </Fab>
      </Zoom>

      {/* ================= BACKDROP ================= */}
      <Backdrop open={loading} sx={{ zIndex: 9999 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress color="primary" />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Processing...
          </Typography>
        </Box>
      </Backdrop>

      {/* ================= SNACKBAR ================= */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}