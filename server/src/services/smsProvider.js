/**
 * Minimal SMS-sending abstraction.
 *
 * No real SMS gateway is configured -- there are no provider credentials in
 * this project. sendSms() below is a STUB: it logs the message server-side
 * and reports success, so the rest of the notification system (creation,
 * dedupe, status tracking, resend) is real and fully working, but nothing
 * is actually delivered to a phone yet.
 *
 * To wire in a real provider (Twilio, Africa's Talking, Vonage, etc.),
 * replace only the body of sendSms() with that provider's SDK call. Every
 * caller only depends on this function's { success, error? } return shape,
 * so nothing else in the app needs to change.
 */
async function sendSms({ to, message }) {
  if (!to) {
    return { success: false, error: 'No phone number on file for this mother' };
  }

  // --- STUB: replace with a real provider call for production use ---
  console.log(`[SMS STUB] to=${to} :: ${message}`);
  return { success: true };
}

module.exports = { sendSms };
