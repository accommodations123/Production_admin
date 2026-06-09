import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Avatar,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Chip,
  alpha,
} from "@mui/material";
import {
  Info,
  Close,
  Flight,
  Person,
  FlightTakeoff,
  FlightLand,
  CalendarToday,
  Schedule,
  AirlineSeatReclineNormal,
  Home,
  Verified,
  CheckCircle,
  ErrorOutline,
  People,
  ExpandMore,
  ExpandLess,
  ChevronRight,
  ArrowForward,
} from "@mui/icons-material";

export default function TripDetailsModal({ open, onClose, trip, matches }) {
  const [expanded, setExpanded] = useState(false);

  if (!trip) return null;

  const relatedMatches = matches.filter(
    (m) => m.trip_id === trip.id || m.matched_trip_id === trip.id
  );

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1, borderBottom: '1px solid #eee' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ bgcolor: alpha('#1976d2', 0.1), borderRadius: 2, p: 1, mr: 2 }}>
              <Info sx={{ fontSize: 20, color: '#1976d2' }} />
            </Box>
            <Typography variant="h6" fontWeight="bold">
              Trip Full Details
            </Typography>
          </Box>
          <IconButton edge="end" onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={3}>
          {/* Trip Information Card */}
          <Card elevation={0} sx={{ borderRadius: 2, bgcolor: '#f9f9f9' }}>
            <CardHeader
              title="Trip Information"
              titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
              avatar={
                <Avatar sx={{ bgcolor: '#1976d2' }}>
                  <Flight />
                </Avatar>
              }
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <FlightTakeoff sx={{ fontSize: 16, color: '#888', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      From
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={500}>
                    {trip.from_city}, {trip.from_country}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <FlightLand sx={{ fontSize: 16, color: '#888', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      To
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={500}>
                    {trip.to_city}, {trip.to_country}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarToday sx={{ fontSize: 16, color: '#888', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Travel Date
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={500}>
                    {trip.travel_date}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Schedule sx={{ fontSize: 16, color: '#888', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Departure Time
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={500}>
                    {trip.departure_time}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Schedule sx={{ fontSize: 16, color: '#888', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Arrival
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={500}>
                    {trip.arrival_date} | {trip.arrival_time}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AirlineSeatReclineNormal sx={{ fontSize: 16, color: '#888', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Airline
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={500}>
                    {trip.airline} ({trip.flight_number})
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Host Details Card */}
          <Card elevation={0} sx={{ borderRadius: 2, bgcolor: '#f9f9f9' }}>
            <CardHeader
              title="Host Details"
              titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
              avatar={
                <Avatar sx={{ bgcolor: '#4caf50' }}>
                  <Person />
                </Avatar>
              }
            />
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 2, width: 48, height: 48, bgcolor: '#1976d2' }}>
                  {trip.host?.full_name?.charAt(0) || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="body1" fontWeight={500}>
                    {trip.host?.full_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {trip.host?.User?.email}
                  </Typography>
                </Box>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Home sx={{ fontSize: 16, color: '#888', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      City
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={500}>
                    {trip.host?.city}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Verified sx={{ fontSize: 16, color: '#888', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Verified
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={500}>
                    {trip.host?.User?.verified ? (
                      <Chip label="Yes" color="success" size="small" icon={<CheckCircle sx={{ fontSize: 14 }} />} />
                    ) : (
                      <Chip label="No" color="default" size="small" icon={<ErrorOutline sx={{ fontSize: 14 }} />} />
                    )}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Matched Trips Card */}
          <Card elevation={0} sx={{ borderRadius: 2, bgcolor: '#f9f9f9' }}>
            <CardHeader
              title="Matched Trips"
              titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
              avatar={
                <Avatar sx={{ bgcolor: '#9c27b0' }}>
                  <People />
                </Avatar>
              }
              action={
                <IconButton
                  onClick={handleExpandClick}
                  aria-expanded={expanded}
                  aria-label="show more"
                >
                  {expanded ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              }
            />
            <CardContent>
              {relatedMatches.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <ErrorOutline sx={{ fontSize: 32, color: '#ccc', mb: 1 }} />
                  <Typography color="text.secondary">
                    No matches available
                  </Typography>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {relatedMatches.slice(0, expanded ? relatedMatches.length : 3).map((m, index) => (
                    <ListItem key={m.id} sx={{ bgcolor: '#fff', mb: 1, borderRadius: 2, p: 2 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#9c27b0' }}>
                          <People sx={{ fontSize: 20 }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`Match ID: ${m.id}`}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Created: {new Date(m.createdAt).toLocaleString()}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <Chip 
                                label={m.status.toUpperCase()} 
                                color={
                                  m.status === 'active' ? 'success' : 
                                  m.status === 'completed' ? 'default' : 
                                  'warning'
                                } 
                                size="small"
                                sx={{ mr: 1 }}
                              />
                              
                            </Box>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" aria-label="details">
                          <ChevronRight />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Stack>
      </DialogContent>

    
    </Dialog>
  );
}