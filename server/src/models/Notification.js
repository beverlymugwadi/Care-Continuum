const mongoose = require('mongoose');

// Kept intentionally small and mother-facing -- these are the events the
// mother herself is told about, not every internal system event.
const NOTIFICATION_TYPES = [
  'anc_upcoming', // "here's your next visit" -- sent once at registration
  'anc_reminder_7d', // 7 days before a scheduled ANC contact
  'anc_reminder_1d', // 1 day before a scheduled ANC contact
  'anc_missed', // a scheduled ANC contact's date passed with no visit logged
  'record_updated', // birth recorded / growth logged / vaccination given / ANC visit logged
  'vaccination_due', // a dose is due soon
  'vaccination_overdue', // a dose's due date has passed, still not given
  'growth_check_due', // routine growth checkup coming up
  'danger_sign_alert', // CHW-flagged concern, or an automatic growth-risk flag
];

const notificationSchema = new mongoose.Schema({
  motherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mother',
    required: true,
  },
  // Present for child-related notifications (vaccination, growth); absent
  // for mother-only ones (ANC visits, general record updates about her).
  childId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child',
  },
  type: {
    type: String,
    enum: NOTIFICATION_TYPES,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  // Plain-language, mother-facing text -- this is what actually gets sent.
  message: {
    type: String,
    required: true,
    trim: true,
  },
  channel: {
    type: String,
    enum: ['sms'],
    default: 'sms',
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending',
  },
  // Uniquely identifies "this specific notification event" (e.g. "contact
  // 3's 7-day reminder for mother X") so a periodic scan can run repeatedly
  // without ever creating the same notification twice. Enforced at the DB
  // level, not just checked in application code, so it's safe even if two
  // scans somehow overlap.
  dedupeKey: {
    type: String,
    required: true,
    unique: true,
  },
  sentAt: {
    type: Date,
  },
  error: {
    type: String,
  },
  // 'system' for scan-generated/automatic notifications, or the CHW user's
  // id for ones a CHW triggered directly (a manual health alert, a resend).
  createdBy: {
    type: String,
    default: 'system',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Notification = mongoose.model('Notification', notificationSchema);
Notification.TYPES = NOTIFICATION_TYPES;

module.exports = Notification;
