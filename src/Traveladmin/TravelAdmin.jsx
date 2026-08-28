import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
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
  MdSearch as Search,
  MdClose as Close,
  MdRefresh as Refresh,
  MdFilterList as FilterList,
  MdCalendarToday as CalendarToday,
  MdFlightTakeoff as FlightTakeoff,
  MdFlightLand as FlightLand,
  MdAirlineSeatReclineNormal as AirlineSeatReclineNormal,
  MdBlock as Block,
  MdCancel as Cancel,
  MdInfo as Info,
  MdErrorOutline as ErrorOutline,
  MdPeople as People,
  MdSchedule as Schedule,
  MdCheckCircle as CheckCircle,
  MdFlight as Flight,
  MdCheck as Check,
} from "react-icons/md";

// Assuming these are in your project directory
import TripDetailsModal from "./TripDetailsModal";
import TravelDashboard from "./TravelDashboard";
import { formatUTCDate, formatUTCTime } from "../utils/timezone";

/* =====================
   API CONFIG
===================== */
const BASE_URL = import.meta.env.VITE_API_URL || "https://api.nextkinlife.live";
const TOKEN = localStorage.getItem("admin-auth");

/* =====================
   MAIN COMPONENT
===================== */
export default function TravelAdmin() {
  const [trips, setTrips] = useState([]);
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
      const res = await axios.get(`${BASE_URL}/travel/admin/trips`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      const data = res.data;
      setTrips(data.results || []);
      return data.results || [];
    } catch (err) {
      console.error("Error fetching trips:", err);
      return [];
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const tripsData = await fetchTrips();

      setStats({
        totalTrips: tripsData.length,
        approvedTrips: tripsData.filter(t => t.status === 'approved').length,
        completedTrips: tripsData.filter(t => t.status === 'completed').length,
      });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to refresh data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const [stats, setStats] = useState({
    totalTrips: 0,
    approvedTrips: 0,
    completedTrips: 0,
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
      const res = await axios({
        url,
        method,
        headers: { Authorization: `Bearer ${TOKEN}` }
      });

      setSnackbar({ open: true, message: successMsg, severity: 'success' });
      fetchAll(); // Refresh to see cascading updates (e.g. cancelled matches)
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Action failed';
      setSnackbar({ open: true, message: errMsg, severity: 'error' });
    } finally {
      setLoading(false);
      setConfirmDialog({ ...confirmDialog, open: false });
    }
  };

  const initiateApproveTrip = (tripId) => {
    setConfirmDialog({
      open: true,
      action: () => handleAction(`${BASE_URL}/travel/admin/trips/${tripId}/approve`, 'PUT', 'Trip approved successfully'),
      title: 'Approve Trip',
      message: 'Are you sure you want to approve this trip?'
    });
  };

  const initiateRejectTrip = (tripId) => {
    setConfirmDialog({
      open: true,
      action: () => handleAction(`${BASE_URL}/travel/admin/trips/${tripId}/reject`, 'PUT', 'Trip rejected successfully'),
      title: 'Reject Trip',
      message: 'Are you sure you want to reject this trip?'
    });
  };

  const initiateCancelTrip = (tripId) => {
    setConfirmDialog({
      open: true,
      action: () => handleAction(`${BASE_URL}/travel/admin/trips/${tripId}/cancel`, 'PUT', 'Trip cancelled successfully'),
      title: 'Cancel Trip',
      message: 'Are you sure? This will cancel the trip.'
    });
  };

  const initiateBlockHost = (hostId) => {
    setConfirmDialog({
      open: true,
      action: () => handleAction(`${BASE_URL}/travel/admin/hosts/${hostId}/block`, 'PUT', 'Host blocked. All trips cancelled.'),
      title: 'Block Host',
      message: 'WARNING: This will block the host and CANCEL ALL their trips. This action is irreversible.'
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
      if (tabValue === 1) { // Approved Tab
        matchesStatus = t.status === 'approved';
      } else if (tabValue === 2) { // Pending Tab
        matchesStatus = t.status === 'pending';
      } else if (tabValue === 3) { // Expired Tab
        matchesStatus = t.status === 'expired';
      } else { // All Trips Tab (or default)
        matchesStatus = statusFilter === "all" || t.status === statusFilter;
      }

      return matchesSearch && matchesStatus;
    });
  }, [trips, search, statusFilter, tabValue]);

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
          trips={trips}
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
              <Tab label="Approved Trips" icon={<CheckCircle sx={{ fontSize: 18 }} />} iconPosition="start" />
              <Tab label="Pending Trips" icon={<Schedule sx={{ fontSize: 18 }} />} iconPosition="start" />
              <Tab label="Expired Trips" icon={<Cancel sx={{ fontSize: 18 }} />} iconPosition="start" />
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
                    placeholder="Search by city, airline, traveler..."
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

              <Grid item xs={12} md={6}>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }} disabled={tabValue === 1 || tabValue === 2 || tabValue === 3}>
                    <InputLabel id="status-filter-label">Status</InputLabel>
                    <Select
                      labelId="status-filter-label"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      label="Status"
                      startAdornment={<FilterList sx={{ fontSize: 16, mr: 1 }} />}
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="approved">Approved</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                      <MenuItem value="expired">Expired</MenuItem>
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
            </Grid>

            {/* ================= TABLE ================= */}
            <TableContainer>
              <Table>
                {/* HEADERS */}
                <TableHead>
                  <TableRow>
                    <TableCell>Traveler</TableCell>
                    <TableCell>Route</TableCell>
                    <TableCell>Flight</TableCell>
                    <TableCell>Departure</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
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
                      </TableRow>
                    ))
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
                                {formatUTCDate(t.travel_date, t.departure_time)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatUTCTime(t.travel_date, t.departure_time)}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={t.status ? t.status.toUpperCase() : 'UNKNOWN'}
                            color={
                              t.status === 'approved' ? 'success' :
                                t.status === 'completed' ? 'default' :
                                  t.status === 'cancelled' ? 'error' :
                                    t.status === 'rejected' ? 'error' :
                                      t.status === 'expired' ? 'default' :
                                        'warning'
                            }
                            size="small"
                            sx={{ fontWeight: 500 }}
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

                            {/* Approve Trip */}
                            {t.status === 'pending' && (
                              <Tooltip title="Approve Trip">
                                <IconButton
                                  size="small"
                                  onClick={() => initiateApproveTrip(t.id)}
                                  color="success"
                                >
                                  <Check sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>
                            )}

                            {/* Reject Trip */}
                            {t.status === 'pending' && (
                              <Tooltip title="Reject Trip">
                                <IconButton
                                  size="small"
                                  onClick={() => initiateRejectTrip(t.id)}
                                  color="error"
                                >
                                  <Cancel sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>
                            )}

                            {/* Cancel Trip */}
                            {t.status === 'approved' && (
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
                            {t.host?.id && (
                              <Tooltip title="Block Host">
                                <IconButton
                                  size="small"
                                  onClick={() => initiateBlockHost(t.host.id)}
                                  sx={{ color: '#d32f2f' }}
                                >
                                  <Block sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {!loading && !filteredTrips.length && (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <ErrorOutline sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                  <Typography color="text.secondary">
                    No trips found matching your criteria
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
          <Button
            onClick={confirmDialog.action}
            color={
              confirmDialog.title.includes('Approve')
                ? 'success'
                : confirmDialog.title.includes('Cancel') || confirmDialog.title.includes('Reject')
                  ? 'error'
                  : 'warning'
            }
            autoFocus
            variant="contained"
          >
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