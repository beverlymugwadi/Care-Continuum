const config = require('../config');

/**
 * SMS-sending abstraction, backed by Twilio when credentials are present in
 * the environment (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN, plus either
 * TWILIO_PHONE_NUMBER or TWILIO_MESSAGING_SERVICE_SID -- see .env.example).
 *
 * With no Twilio credentials configured, sendSms() falls back to a STUB
 * that logs the message server-side and reports success, so the rest of
 * the notification system (creation, dedupe, status tracking, resend)
 * stays fully exercisable without an SMS account. Every caller only
 * depends on this function's { success, error? } return shape, so nothing
 * else in the app needs to change either way.
 */

const twilioConfigured = Boolean(
  config.twilio.accountSid && config.twilio.authToken && (config.twilio.phoneNumber || config.twilio.messagingServiceSid)
);

// Constructed lazily (not at module load) so requiring this file never
// fails just because Twilio isn't configured -- most dev/test environments.
let twilioClient = null;
function getTwilioClient() {
  if (!twilioClient) {
    // eslint-disable-next-line global-require -- lazy require, see above
    const twilio = require('twilio');
    twilioClient = twilio(config.twilio.accountSid, config.twilio.authToken);
  }
  return twilioClient;
}

async function sendSms({ to, message }) {
  if (!to) {
    return { success: false, error: 'No phone number on file for this mother' };
  }

  if (!twilioConfigured) {
    // --- STUB: no SMS provider configured, see .env.example ---
    console.log(`[SMS STUB] to=${to} :: ${message}`);
    return { success: true };
  }

  try {
    const client = getTwilioClient();
    const params = { to, body: message };
    if (config.twilio.messagingServiceSid) {
      params.messagingServiceSid = config.twilio.messagingServiceSid;
    } else {
      params.from = config.twilio.phoneNumber;
    }

    await client.messages.create(params);
    return { success: true };
  } catch (err) {
    // Twilio errors carry a human-readable .message (e.g. invalid/unverified
    // number, unsupported destination) -- surfaced as-is so it shows up
    // directly in the notification's status in the UI.
    console.error(`[SMS] Failed to send to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { sendSms };
