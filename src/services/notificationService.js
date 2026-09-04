import { supabase } from '../lib/supabase';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || "https://api.nextkinlife.live";
const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin-auth");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Dispatch an in-app notification and email to a recipient
 */
export async function sendNotification({
  userId,
  recipientId,
  userEmail,
  email,
  title,
  message,
  body,
  type = 'info',
  actionUrl = '',
  metadata = {},
}) {
  const targetUserId = userId || recipientId;
  const targetEmail = userEmail || email;
  const notificationBody = body || message;

  // 1. In-App Notification (Supabase)
  try {
    if (targetUserId) {
      await supabase
        .from('notifications')
        .insert([{
          recipient_id: targetUserId,
          target_role: 'user',
          title,
          message: notificationBody,
          type: (type || 'SYSTEM_NOTIFICATION').toUpperCase(),
          action_url: actionUrl || '',
          metadata: metadata || {},
          channel: 'both',
          is_read: false,
          created_at: new Date().toISOString()
        }]);
    }
  } catch (err) {
    console.warn("In-app notification insert skipped/failed:", err.message);
  }

  // 2. Email Dispatch
  if (targetEmail) {
    try {
      await api.post('/api/notifications/send-email', {
        to: targetEmail,
        userId: targetUserId,
        subject: title,
        message: notificationBody,
        type,
        actionUrl,
        metadata
      }).catch(async () => {
        // Fallback endpoint if custom route
        return api.post('/notifications/email', {
          to: targetEmail,
          subject: title,
          body: notificationBody,
          type
        }).catch(e => {
          console.warn("Email API notification skipped:", e.message);
        });
      });
    } catch (err) {
      console.warn("Failed to dispatch email:", err.message);
    }
  }

  return { success: true };
}

/* ═══════ SPECIALIZED ADMIN MODERATION DISPATCHERS ═══════ */

/**
 * Notify user of Host Approval
 */
export async function notifyHostApproval({ hostId, hostEmail, hostName = 'Host' }) {
  return sendNotification({
    userId: hostId,
    userEmail: hostEmail,
    type: 'HOST_APPROVED',
    title: '🎉 Your Host Account has been Approved!',
    message: `Hello ${hostName}, congratulations! Your host profile has been verified and approved by the NextKinLife administrator. You can now list properties and host travelers worldwide.`,
    actionUrl: '/dashboard/host-details',
    metadata: { hostId, status: 'approved' }
  });
}

/**
 * Notify user of Host Rejection
 */
export async function notifyHostRejection({ hostId, hostEmail, hostName = 'Applicant', reason }) {
  return sendNotification({
    userId: hostId,
    userEmail: hostEmail,
    type: 'HOST_REJECTED',
    title: 'Update on your Host Application',
    message: `Hello ${hostName}, your host application was reviewed by our moderation team. Unfortunately, it could not be approved at this time.${reason ? ` Reason: ${reason}` : ''} Please update your verification details and re-apply.`,
    actionUrl: '/dashboard/host-details',
    metadata: { hostId, status: 'rejected', reason }
  });
}

/**
 * Notify user of Property Listing Approval
 */
export async function notifyPropertyApproval({ hostId, hostEmail, propertyTitle = 'Property', propertyId }) {
  return sendNotification({
    userId: hostId,
    userEmail: hostEmail,
    type: 'PROPERTY_APPROVED',
    title: '🏠 Property Listing Approved!',
    message: `Great news! Your property listing "${propertyTitle}" has been approved and is now live in the accommodation directory for travelers to book.`,
    actionUrl: `/accommodations/property/${propertyId}`,
    metadata: { propertyId, status: 'approved' }
  });
}

/**
 * Notify user of Property Listing Rejection
 */
export async function notifyPropertyRejection({ hostId, hostEmail, propertyTitle = 'Property', propertyId, reason }) {
  return sendNotification({
    userId: hostId,
    userEmail: hostEmail,
    type: 'PROPERTY_REJECTED',
    title: 'Property Listing Update',
    message: `Your property listing "${propertyTitle}" was reviewed.${reason ? ` Reason: ${reason}` : ''} Please revise the listing details and submit again.`,
    actionUrl: `/accommodations/property/${propertyId}`,
    metadata: { propertyId, status: 'rejected', reason }
  });
}

/**
 * Notify user of Stay Request Approval
 */
export async function notifyStayRequestApproval({ userId, userEmail, userName = 'Traveler', title = 'Stay Request', requestId }) {
  return sendNotification({
    userId,
    userEmail,
    type: 'STAY_REQUEST_APPROVED',
    title: '✨ Stay Request Approved!',
    message: `Hello ${userName}, your stay request "${title}" has been approved and published to our community network. Hosts can now view and respond to your request.`,
    actionUrl: `/post-stay-requests/${requestId}`,
    metadata: { requestId, status: 'approved' }
  });
}

/**
 * Notify user of Stay Request Rejection
 */
export async function notifyStayRequestRejection({ userId, userEmail, userName = 'Traveler', title = 'Stay Request', requestId, reason }) {
  return sendNotification({
    userId,
    userEmail,
    type: 'STAY_REQUEST_REJECTED',
    title: 'Stay Request Update',
    message: `Hello ${userName}, your stay request "${title}" could not be approved at this time.${reason ? ` Reason: ${reason}` : ''}`,
    actionUrl: `/post-stay-requests/${requestId}`,
    metadata: { requestId, status: 'rejected', reason }
  });
}

/**
 * Notify user of Marketplace (Buy & Sell) Listing Approval
 */
export async function notifyListingApproval({ sellerId, sellerEmail, listingTitle = 'Item', listingId }) {
  return sendNotification({
    userId: sellerId,
    userEmail: sellerEmail,
    type: 'BUY_SELL_APPROVED',
    title: '📦 Marketplace Listing Approved!',
    message: `Your marketplace listing "${listingTitle}" has been approved and is now visible to buyers across NextKinLife.`,
    actionUrl: `/buysell/item/${listingId}`,
    metadata: { listingId, status: 'approved' }
  });
}

/**
 * Notify user of Marketplace Listing Rejection
 */
export async function notifyListingRejection({ sellerId, sellerEmail, listingTitle = 'Item', listingId, reason }) {
  return sendNotification({
    userId: sellerId,
    userEmail: sellerEmail,
    type: 'BUY_SELL_REJECTED',
    title: 'Marketplace Listing Update',
    message: `Your marketplace listing "${listingTitle}" was reviewed.${reason ? ` Reason: ${reason}` : ''}`,
    actionUrl: `/buysell/item/${listingId}`,
    metadata: { listingId, status: 'rejected', reason }
  });
}

/**
 * Notify user of Event Approval
 */
export async function notifyEventApproval({ hostId, hostEmail, eventTitle = 'Event', eventId }) {
  return sendNotification({
    userId: hostId,
    userEmail: hostEmail,
    type: 'EVENT_APPROVED',
    title: '🎉 Event Approved & Published!',
    message: `Your event "${eventTitle}" has been approved and is now live for community attendees to register.`,
    actionUrl: `/events/${eventId}`,
    metadata: { eventId, status: 'approved' }
  });
}

/**
 * Notify user of Event Rejection
 */
export async function notifyEventRejection({ hostId, hostEmail, eventTitle = 'Event', eventId, reason }) {
  return sendNotification({
    userId: hostId,
    userEmail: hostEmail,
    type: 'EVENT_REJECTED',
    title: 'Event Moderation Notice',
    message: `Your event submission "${eventTitle}" could not be approved.${reason ? ` Reason: ${reason}` : ''}`,
    actionUrl: `/events/${eventId}`,
    metadata: { eventId, status: 'rejected', reason }
  });
}
