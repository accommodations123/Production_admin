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
 * Helper to build clean, branded HTML email templates
 */
function buildHtmlEmail({ title, message, actionUrl, ctaText = 'View on NextKinLife' }) {
  const fullActionUrl = actionUrl
    ? (actionUrl.startsWith('http') ? actionUrl : `https://nextkinlife.live${actionUrl}`)
    : 'https://nextkinlife.live';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 16px;">
          <tr>
            <td align="center">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                <!-- Header -->
                <tr>
                  <td style="background-color: #cb2926; padding: 28px 36px; text-align: left;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.02em;">
                      NextKinLife
                    </h1>
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="padding: 36px;">
                    <h2 style="color: #0f172a; margin: 0 0 16px 0; font-size: 20px; font-weight: 600; line-height: 1.3;">
                      ${title}
                    </h2>
                    <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 28px 0;">
                      ${message}
                    </p>
                    ${actionUrl ? `
                      <table border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 28px;">
                        <tr>
                          <td align="center" style="border-radius: 10px; background-color: #cb2926;">
                            <a href="${fullActionUrl}" target="_blank" style="font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; padding: 12px 28px; display: inline-block; border-radius: 10px;">
                              ${ctaText} &rarr;
                            </a>
                          </td>
                        </tr>
                      </table>
                    ` : ''}
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0 20px 0;" />
                    <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 0;">
                      If you have any questions or need assistance, reply to this email or reach out to our community moderation team.
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f1f5f9; padding: 20px 36px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #64748b; font-size: 12px; margin: 0;">
                      &copy; ${new Date().getFullYear()} NextKinLife. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

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
  type = 'SYSTEM_NOTIFICATION',
  entityType = '',
  entityId = '',
  actionUrl = '',
  metadata = {},
  subject = '',
  html = null,
}) {
  let targetUserId = userId || recipientId;
  let targetEmail = userEmail || email;
  const notificationBody = body || message || '';
  const notificationTitle = title || subject || 'Notification';
  const emailSubject = subject || title || 'Notification from NextKinLife';

  // 1. Resolve missing recipient email or user ID from profiles
  if (supabase) {
    try {
      if (!targetEmail && targetUserId) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', targetUserId)
          .maybeSingle();
        if (prof?.email) {
          targetEmail = prof.email;
        }
      } else if (!targetUserId && targetEmail) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('id')
          .ilike('email', targetEmail)
          .maybeSingle();
        if (prof?.id) {
          targetUserId = prof.id;
        }
      }
    } catch (resolveErr) {
      console.warn("Could not resolve profile details for notification:", resolveErr);
    }
  }

  // Determine current admin actor ID
  let actorId = null;
  try {
    const adminUser = localStorage.getItem("admin-user");
    if (adminUser) {
      const parsed = JSON.parse(adminUser);
      actorId = parsed?.id || null;
    }
  } catch (e) {
    // Ignore parse error
  }

  // 2. Insert In-App Notification (Supabase notifications table)
  try {
    if (supabase && targetUserId) {
      const payload = {
        recipient_id: targetUserId,
        actor_id: actorId,
        target_role: 'user',
        type: (type || 'SYSTEM_NOTIFICATION').toUpperCase(),
        title: notificationTitle,
        message: notificationBody,
        entity_type: entityType || null,
        entity_id: entityId ? String(entityId) : null,
        action_url: actionUrl || '',
        metadata: metadata || {},
        channel: 'both',
        is_read: false,
        email_status: 'pending',
        created_at: new Date().toISOString(),
      };

      const { error: notifErr } = await supabase
        .from('notifications')
        .insert([payload]);

      if (notifErr) {
        console.warn("In-app notification insert warning:", notifErr.message);
      } else {
        console.log(`[Notification] In-app notification created for ${targetUserId} (${type})`);
      }
    }
  } catch (err) {
    console.warn("In-app notification insert failed:", err.message);
  }

  // 3. Dispatch Transactional Email via Supabase Edge Function `send-email`
  if (targetEmail && targetEmail.includes('@')) {
    const emailHtml = html || buildHtmlEmail({
      title: notificationTitle,
      message: notificationBody,
      actionUrl,
    });

    // Primary: Invoke Supabase Edge Function `send-email`
    if (supabase?.functions) {
      try {
        const { data: edgeData, error: edgeErr } = await supabase.functions.invoke('send-email', {
          body: {
            to: targetEmail,
            subject: emailSubject,
            html: emailHtml,
            text: notificationBody,
          }
        });

        if (edgeErr) {
          console.warn("[Email] Supabase send-email edge function error:", edgeErr.message);
        } else {
          console.log(`[Email] Successfully sent email to ${targetEmail} via Supabase Edge Function`);
          return { success: true };
        }
      } catch (edgeEx) {
        console.warn("[Email] Edge function invocation exception:", edgeEx.message);
      }
    }

    // Secondary / Fallback: Try API server if configured
    try {
      await api.post('/api/notifications/send-email', {
        to: targetEmail,
        userId: targetUserId,
        subject: emailSubject,
        message: notificationBody,
        type,
        actionUrl,
        metadata
      }).catch(async () => {
        return api.post('/notifications/email', {
          to: targetEmail,
          subject: emailSubject,
          body: notificationBody,
          type
        });
      });
    } catch (apiErr) {
      console.warn("[Email] Fallback API email dispatch skipped:", apiErr.message);
    }
  }

  return { success: true };
}

/* ═══════ SPECIALIZED ADMIN MODERATION DISPATCHERS ═══════ */

/**
 * 1. ACCOMMODATION APPROVAL & REJECTION
 */
export async function notifyPropertyApproval({ hostId, hostEmail, propertyTitle = 'Accommodation', propertyId }) {
  return sendNotification({
    userId: hostId,
    userEmail: hostEmail,
    type: 'PROPERTY_APPROVED',
    entityType: 'property',
    entityId: propertyId,
    title: '🎉 Accommodation Approved & Verified!',
    subject: `🎉 Your Space "${propertyTitle}" is Approved!`,
    message: `Great news! Your space "${propertyTitle}" has been approved by NextKinLife admin and is now live and verified for travelers to book.`,
    actionUrl: `/rooms/${propertyId}`,
    metadata: { propertyId, status: 'approved' }
  });
}

export async function notifyPropertyRejection({ hostId, hostEmail, propertyTitle = 'Accommodation', propertyId, reason }) {
  return sendNotification({
    userId: hostId,
    userEmail: hostEmail,
    type: 'PROPERTY_REJECTED',
    entityType: 'property',
    entityId: propertyId,
    title: 'Update on your Accommodation Listing',
    subject: `Update on your Accommodation Listing "${propertyTitle}"`,
    message: `Your property listing "${propertyTitle}" was reviewed by our moderation team.${reason ? ` Reason: ${reason}` : ''} Please update the listing details and submit again.`,
    actionUrl: `/rooms/${propertyId}`,
    metadata: { propertyId, status: 'rejected', reason }
  });
}

/**
 * 2. EVENT APPROVAL & REJECTION
 */
export async function notifyEventApproval({ hostId, hostEmail, eventTitle = 'Event', eventId }) {
  return sendNotification({
    userId: hostId,
    userEmail: hostEmail,
    type: 'EVENT_APPROVED',
    entityType: 'event',
    entityId: eventId,
    title: '🎉 Your Event is Approved!',
    subject: `🎉 Your Event "${eventTitle}" is Approved!`,
    message: `Your community event "${eventTitle}" has been approved and published to NextKinLife. Attendees can now discover and register for your event.`,
    actionUrl: `/events/${eventId}`,
    metadata: { eventId, status: 'approved' }
  });
}

export async function notifyEventRejection({ hostId, hostEmail, eventTitle = 'Event', eventId, reason }) {
  return sendNotification({
    userId: hostId,
    userEmail: hostEmail,
    type: 'EVENT_REJECTED',
    entityType: 'event',
    entityId: eventId,
    title: 'Update on your Event Submission',
    subject: `Update on your Event Submission "${eventTitle}"`,
    message: `Your event submission "${eventTitle}" was reviewed by our moderation team.${reason ? ` Reason: ${reason}` : ''} Please revise your event details and submit again.`,
    actionUrl: `/events/${eventId}`,
    metadata: { eventId, status: 'rejected', reason }
  });
}

/**
 * 3. MARKETPLACE (BUY & SELL) LISTING APPROVAL & REJECTION
 */
export async function notifyListingApproval({ sellerId, sellerEmail, listingTitle = 'Marketplace Item', listingId }) {
  return sendNotification({
    userId: sellerId,
    userEmail: sellerEmail,
    type: 'BUY_SELL_APPROVED',
    entityType: 'buy_sell',
    entityId: listingId,
    title: '🎉 Marketplace Item Approved!',
    subject: `🎉 Your Listing "${listingTitle}" is Approved!`,
    message: `Your listing "${listingTitle}" is approved and visible to buyers in the NextKinLife Marketplace.`,
    actionUrl: `/marketplace/${listingId}`,
    metadata: { listingId, status: 'approved' }
  });
}

export async function notifyListingRejection({ sellerId, sellerEmail, listingTitle = 'Marketplace Item', listingId, reason }) {
  return sendNotification({
    userId: sellerId,
    userEmail: sellerEmail,
    type: 'BUY_SELL_REJECTED',
    entityType: 'buy_sell',
    entityId: listingId,
    title: 'Marketplace Listing Update',
    subject: `Update on your Marketplace Listing "${listingTitle}"`,
    message: `Your marketplace listing "${listingTitle}" was reviewed by our moderation team.${reason ? ` Reason: ${reason}` : ''} Please update your item details and submit again.`,
    actionUrl: `/marketplace/${listingId}`,
    metadata: { listingId, status: 'rejected', reason }
  });
}

/**
 * 4. HOST APPLICATION APPROVAL & REJECTION
 */
export async function notifyHostApproval({ hostId, hostEmail, hostName = 'Host' }) {
  return sendNotification({
    userId: hostId,
    userEmail: hostEmail,
    type: 'HOST_APPROVED',
    entityType: 'host',
    entityId: hostId,
    title: '🎉 Your Host Account has been Approved!',
    subject: '🎉 Congratulations! Your Host Profile is Approved',
    message: `Hello ${hostName}, congratulations! Your host profile has been verified and approved by the NextKinLife administrator. You can now list properties and host travelers worldwide.`,
    actionUrl: '/dashboard/host-details',
    metadata: { hostId, status: 'approved' }
  });
}

export async function notifyHostRejection({ hostId, hostEmail, hostName = 'Applicant', reason }) {
  return sendNotification({
    userId: hostId,
    userEmail: hostEmail,
    type: 'HOST_REJECTED',
    entityType: 'host',
    entityId: hostId,
    title: 'Update on your Host Application',
    subject: 'Update on your NextKinLife Host Application',
    message: `Hello ${hostName}, your host application was reviewed by our moderation team. Unfortunately, it could not be approved at this time.${reason ? ` Reason: ${reason}` : ''} Please update your verification details and re-apply.`,
    actionUrl: '/dashboard/host-details',
    metadata: { hostId, status: 'rejected', reason }
  });
}

/**
 * 5. STAY REQUEST APPROVAL & REJECTION
 */
export async function notifyStayRequestApproval({ userId, userEmail, userName = 'Traveler', title = 'Stay Request', requestId }) {
  return sendNotification({
    userId,
    userEmail,
    type: 'STAY_REQUEST_APPROVED',
    entityType: 'stay_request',
    entityId: requestId,
    title: '✨ Stay Request Approved!',
    subject: `✨ Your Stay Request "${title}" is Approved!`,
    message: `Hello ${userName}, your stay request "${title}" has been approved and published to our community network. Hosts can now view and respond to your request.`,
    actionUrl: `/post-stay-requests/${requestId}`,
    metadata: { requestId, status: 'approved' }
  });
}

export async function notifyStayRequestRejection({ userId, userEmail, userName = 'Traveler', title = 'Stay Request', requestId, reason }) {
  return sendNotification({
    userId,
    userEmail,
    type: 'STAY_REQUEST_REJECTED',
    entityType: 'stay_request',
    entityId: requestId,
    title: 'Stay Request Update',
    subject: `Update on your Stay Request "${title}"`,
    message: `Hello ${userName}, your stay request "${title}" could not be approved at this time.${reason ? ` Reason: ${reason}` : ''}`,
    actionUrl: `/post-stay-requests/${requestId}`,
    metadata: { requestId, status: 'rejected', reason }
  });
}
