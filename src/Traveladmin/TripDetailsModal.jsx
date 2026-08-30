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
  MdInfo as Info,
  MdClose as Close,
  MdFlight as Flight,
  MdPerson as Person,
  MdFlightTakeoff as FlightTakeoff,
  MdFlightLand as FlightLand,
  MdCalendarToday as CalendarToday,
  MdSchedule as Schedule,
  MdAirlineSeatReclineNormal as AirlineSeatReclineNormal,
  MdHome as Home,
  MdVerified as Verified,
  MdCheckCircle as CheckCircle,
  MdErrorOutline as ErrorOutline,
  MdPeople as People,
  MdExpandMore as ExpandMore,
  MdExpandLess as ExpandLess,
  MdChevronRight as ChevronRight,
  MdArrowForward as ArrowForward,
  MdPhone as Phone,
} from "react-icons/md";
import { FaWhatsapp as WhatsApp, FaFacebook as Facebook, FaInstagram as Instagram } from "react-icons/fa";
import { formatUTCDate, formatUTCTime } from "../utils/timezone";

export default function TripDetailsModal({ open, onClose, trip }) {
  if (!trip) return null;

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
                      From (Origin)
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={500}>
                    {trip.origin || [trip.from_city, trip.from_country].filter(Boolean).join(', ') || 'Origin not specified'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <FlightLand sx={{ fontSize: 16, color: '#888', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      To (Destination)
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={500}>
                    {trip.destination || [trip.to_city, trip.to_country].filter(Boolean).join(', ') || 'Destination not specified'}
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
                    {trip.travel_date ? formatUTCDate(trip.travel_date, trip.departure_time) : (trip.date || "Date not specified")}
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
                    {trip.departure_time ? formatUTCTime(trip.travel_date, trip.departure_time) : (trip.time || "Time not specified")}
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
                    {trip.arrival_date ? `${formatUTCDate(trip.arrival_date, trip.arrival_time)} | ${formatUTCTime(trip.arrival_date, trip.arrival_time)}` : "Not specified"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AirlineSeatReclineNormal sx={{ fontSize: 16, color: '#888', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Airline & Flight
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={500}>
                    {[trip.airline, trip.flight_number ? `(${trip.flight_number})` : null].filter(Boolean).join(' ') || trip.title || 'Flight details not specified'}
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
                  {trip.host?.full_name?.charAt(0) || trip.host?.name?.charAt(0) || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="body1" fontWeight={500}>
                    {trip.host?.full_name || trip.host?.name || "Traveler"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {trip.host?.email || trip.host?.User?.email || "No email available"}
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
                    {trip.host?.city || "N/A"}
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
                    {Boolean(trip.host?.is_verified || trip.host?.verified || trip.host?.User?.verified || trip.host?.is_approved) ? (
                      <Chip label="Yes" color="success" size="small" icon={<CheckCircle sx={{ fontSize: 14 }} />} />
                    ) : (
                      <Chip label="No" color="default" size="small" icon={<ErrorOutline sx={{ fontSize: 14 }} />} />
                    )}
                  </Typography>
                </Grid>
                {trip.host?.phone && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Phone sx={{ fontSize: 16, color: '#888', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Phone
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight={500}>
                      {trip.host.phone}
                    </Typography>
                  </Grid>
                )}
                {trip.host?.whatsapp && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <WhatsApp sx={{ fontSize: 16, color: '#888', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        WhatsApp
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight={500}>
                      {trip.host.whatsapp}
                    </Typography>
                  </Grid>
                )}
                {trip.host?.facebook && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Facebook sx={{ fontSize: 16, color: '#888', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Facebook
                      </Typography>
                    </Box>
                    {trip.host.facebook.startsWith('http') ? (
                      <Typography
                        variant="body1"
                        fontWeight={500}
                        component="a"
                        href={trip.host.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ color: '#1976d2', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                      >
                        View Facebook Profile
                      </Typography>
                    ) : (
                      <Typography variant="body1" fontWeight={500}>
                        {trip.host.facebook}
                      </Typography>
                    )}
                  </Grid>
                )}
                {trip.host?.instagram && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Instagram sx={{ fontSize: 16, color: '#888', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Instagram
                      </Typography>
                    </Box>
                    {trip.host.instagram.startsWith('http') ? (
                      <Typography
                        variant="body1"
                        fontWeight={500}
                        component="a"
                        href={trip.host.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ color: '#1976d2', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                      >
                        View Instagram Profile
                      </Typography>
                    ) : (
                      <Typography variant="body1" fontWeight={500}>
                        {trip.host.instagram}
                      </Typography>
                    )}
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Stack>
      </DialogContent>

    
    </Dialog>
  );
}