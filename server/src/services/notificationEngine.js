const Mother = require('../models/Mother');
const Child = require('../models/Child');
const Notification = require('../models/Notification');
const { sendSms } = require('./smsProvider');
const { addMonths, ageInMonths, daysBetween } = require('../utils/dateMath');

// Same simplification the reminders endpoint uses: growth checkups have no
// stored schedule, so "due" is computed as this many months after the last
// logged entry (or date of birth, if none yet).
const GROWTH_CHECKUP_INTERVAL_MONTHS = 3;
const GROWTH_CHECKUP_MAX_AGE_MONTHS = 60;

function formatDateForSms(date) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ---------------------------------------------------------------------
// Message templates. Kept short, plain, and free of clinical jargon
// (no "gestational week", no "z-score") since these go straight to a
// mother, not a health worker -- per the "simple, clear, easy to
// understand" requirement.
// ---------------------------------------------------------------------
const templates = {
  anc_upcoming: ({ motherName, date, days }) => ({
    title: 'Your next clinic visit',
    message: `Hello ${motherName}, thank you for registering with your health worker. Your next clinic visit is on ${formatDateForSms(date)}, in ${days} day${days === 1 ? '' : 's'}. Please try to attend so we can check on you and your baby.`,
  }),
  anc_reminder_7d: ({ date }) => ({
    title: 'Clinic visit in 7 days',
    message: `Reminder: your next clinic visit is in 7 days, on ${formatDateForSms(date)}. Please plan to attend.`,
  }),
  anc_reminder_1d: ({ date }) => ({
    title: 'Clinic visit tomorrow',
    message: `Reminder: your clinic visit is tomorrow, ${formatDateForSms(date)}. Please remember to attend.`,
  }),
  anc_missed: ({ date }) => ({
    title: 'Missed clinic visit',
    message: `We noticed you may have missed your clinic visit on ${formatDateForSms(date)}. Please contact your health worker to arrange a new visit as soon as you can.`,
  }),
  anc_visit_logged: ({ nextDate, nextDays, allDone }) => ({
    title: 'Visit recorded',
    message: allDone
      ? "Thank you for attending your clinic visit. You have now completed all your scheduled antenatal visits -- well done for taking care of yourself and your baby!"
      : `Thank you for attending your clinic visit. Your next visit is on ${formatDateForSms(nextDate)}, in ${nextDays} day${nextDays === 1 ? '' : 's'}.`,
  }),
  birth_recorded: ({ motherName, weight }) => ({
    title: "Baby's birth recorded",
    message: `Congratulations ${motherName}! Your baby's birth has been recorded. Birth weight: ${weight} kg. Your health worker will now track your baby's growth and vaccinations -- we'll remind you when each one is due.`,
  }),
  growth_recorded: ({ childName, date, weight, height }) => ({
    title: 'Growth checkup recorded',
    message: `${childName}'s growth was checked on ${formatDateForSms(date)}: weight ${weight}kg${height ? `, height ${height}cm` : ''}. Thank you for bringing your child for this checkup.`,
  }),
  vaccination_recorded: ({ childName, vaccine, date }) => ({
    title: 'Vaccination recorded',
    message: `${childName} received the ${vaccine} vaccination on ${formatDateForSms(date)}. Thank you for keeping up with your child's vaccinations.`,
  }),
  vaccination_due: ({ childName, vaccine, date }) => ({
    title: 'Vaccination due soon',
    message: `Reminder: ${childName}'s ${vaccine} vaccination is due on ${formatDateForSms(date)}. Please visit your clinic.`,
  }),
  vaccination_overdue: ({ childName, vaccine, date }) => ({
    title: 'Vaccination overdue',
    message: `${childName}'s ${vaccine} vaccination was due on ${formatDateForSms(date)} and has not yet been given. Please visit your clinic as soon as possible.`,
  }),
  growth_check_due: ({ childName, date }) => ({
    title: 'Growth checkup due',
    message: `It's almost time for ${childName}'s next growth checkup, due around ${formatDateForSms(date)}. Please visit your health worker.`,
  }),
  danger_sign_growth: ({ childName, flags }) => ({
    title: 'Please seek care soon',
    message: `Your health worker noted a concern about ${childName}'s growth (${flags}). Please contact your health worker or visit the clinic soon for further care.`,
  }),
  danger_sign_manual: ({ description }) => ({
    title: 'Please seek care',
    message: `Your health worker has flagged an important health concern: ${description}. Please contact your health worker or seek care as soon as possible.`,
  }),
};

// ---------------------------------------------------------------------
// Core creation helper: builds the message, skips it if this exact event
// was already notified (dedupeKey), attempts to send, and persists the
// result either way. Used by both event-triggered calls (birth recorded,
// etc.) and the periodic scan below.
// ---------------------------------------------------------------------
async function createNotification({ mother, child, type, dedupeKey, templateKey, ctx, createdBy }) {
  const build = templates[templateKey || type];
  const { title, message } = build(ctx);

  const notification = new Notification({
    motherId: mother._id,
    childId: child ? child._id : undefined,
    type,
    title,
    message,
    dedupeKey,
    createdBy: createdBy || 'system',
  });

  const result = await sendSms({ to: mother.contactNumber, message });
  notification.status = result.success ? 'sent' : 'failed';
  if (result.success) notification.sentAt = new Date();
  else notification.error = result.error;

  try {
    await notification.save();
    return notification;
  } catch (err) {
    // Unique index on dedupeKey: if another run created this exact
    // notification a moment ago, treat it as already-handled rather than
    // failing the whole scan.
    if (err.code === 11000) return null;
    throw err;
  }
}

async function alreadyNotified(dedupeKey) {
  const existing = await Notification.exists({ dedupeKey });
  return Boolean(existing);
}

// ---------------------------------------------------------------------
// Event-triggered notifications -- called directly by controllers at the
// moment the underlying event happens, not by the periodic scan.
// ---------------------------------------------------------------------

// Fires once, right when a mother is registered.
async function notifyAncUpcoming(mother) {
  // A mother can be registered partway through pregnancy, in which case
  // her earliest contacts may already be in the past even though she has
  // zero visits logged yet -- find the first one that's actually still
  // ahead of her, not just contact 1.
  const now = new Date();
  const nextContact = mother.ancSchedule.find((contact) => daysBetween(now, contact.date) >= 0);
  if (!nextContact) return null;

  const days = daysBetween(now, nextContact.date);
  return createNotification({
    mother,
    type: 'anc_upcoming',
    templateKey: 'anc_upcoming',
    dedupeKey: `${mother._id}:anc_upcoming:contact-${nextContact.contactNumber}`,
    ctx: { motherName: mother.name, date: nextContact.date, days },
  });
}

// Fires when a CHW logs a completed ANC visit (see mother.controller.js
// updateMother, which detects ancVisitHistory growing).
async function notifyAncVisitLogged(mother) {
  const completed = mother.ancVisitHistory.length;
  const next = mother.ancSchedule[completed];

  return createNotification({
    mother,
    type: 'record_updated',
    templateKey: 'anc_visit_logged',
    dedupeKey: `${mother._id}:record_updated:anc-visit-${completed}`,
    ctx: next
      ? { nextDate: next.date, nextDays: Math.max(daysBetween(new Date(), next.date), 0), allDone: false }
      : { allDone: true },
  });
}

async function notifyBirthRecorded(mother) {
  return createNotification({
    mother,
    type: 'record_updated',
    templateKey: 'birth_recorded',
    dedupeKey: `${mother._id}:record_updated:birth`,
    ctx: { motherName: mother.name, weight: mother.birthDetails.weight },
  });
}

async function notifyGrowthRecorded(mother, child, entry) {
  return createNotification({
    mother,
    child,
    type: 'record_updated',
    templateKey: 'growth_recorded',
    dedupeKey: `${child._id}:record_updated:growth-${new Date(entry.date).getTime()}`,
    ctx: { childName: child.name, date: entry.date, weight: entry.weight, height: entry.height },
  });
}

async function notifyVaccinationRecorded(mother, child, dose) {
  return createNotification({
    mother,
    child,
    type: 'record_updated',
    templateKey: 'vaccination_recorded',
    dedupeKey: `${child._id}:record_updated:vaccination-${dose._id}`,
    ctx: { childName: child.name, vaccine: dose.vaccine, date: dose.completedDate },
  });
}

// A CHW-recorded health concern, OR an automatic flag from a growth entry
// coming back underweight/stunted/wasted.
async function notifyDangerSign(mother, { child, description, flags } = {}) {
  if (flags) {
    return createNotification({
      mother,
      child,
      type: 'danger_sign_alert',
      templateKey: 'danger_sign_growth',
      dedupeKey: `${child._id}:danger_sign_alert:growth-${Date.now()}`,
      ctx: { childName: child.name, flags },
    });
  }

  return createNotification({
    mother,
    child,
    type: 'danger_sign_alert',
    templateKey: 'danger_sign_manual',
    dedupeKey: `${mother._id}:danger_sign_alert:manual-${Date.now()}`,
    ctx: { description },
    createdBy: 'chw',
  });
}

// ---------------------------------------------------------------------
// Periodic scan -- covers the notification types that depend on how much
// time has passed rather than a specific event: ANC reminders/missed
// visits, vaccination due/overdue, growth checkup due. Safe to run as
// often as you like; dedupeKey ensures each event is only ever notified
// once. See server.js for how this gets scheduled.
// ---------------------------------------------------------------------
async function runDueScan() {
  const now = new Date();
  const created = [];

  // --- ANC: 7-day reminder, 1-day reminder, missed ---
  const mothers = await Mother.find({ status: 'pregnant' });
  for (const mother of mothers) {
    const completed = mother.ancVisitHistory.length;
    const pending = mother.ancSchedule.slice(completed);

    for (const contact of pending) {
      const diff = daysBetween(now, contact.date);
      const key = (suffix) => `${mother._id}:${suffix}:contact-${contact.contactNumber}`;

      if (diff === 7 && !(await alreadyNotified(key('anc_reminder_7d')))) {
        created.push(
          await createNotification({
            mother,
            type: 'anc_reminder_7d',
            dedupeKey: key('anc_reminder_7d'),
            ctx: { date: contact.date },
          })
        );
      } else if (diff === 1 && !(await alreadyNotified(key('anc_reminder_1d')))) {
        created.push(
          await createNotification({
            mother,
            type: 'anc_reminder_1d',
            dedupeKey: key('anc_reminder_1d'),
            ctx: { date: contact.date },
          })
        );
      } else if (diff < 0 && !(await alreadyNotified(key('anc_missed')))) {
        created.push(
          await createNotification({
            mother,
            type: 'anc_missed',
            dedupeKey: key('anc_missed'),
            ctx: { date: contact.date },
          })
        );
      }
    }
  }

  // --- Children: vaccination due/overdue, growth checkup due ---
  const children = await Child.find();
  const motherById = new Map(
    (await Mother.find({ _id: { $in: children.map((c) => c.motherId) } })).map((m) => [
      m._id.toString(),
      m,
    ])
  );

  for (const child of children) {
    const mother = motherById.get(child.motherId.toString());
    if (!mother) continue; // orphaned record safety net

    for (const dose of child.vaccinationRecord) {
      if (dose.completed) continue;
      const diff = daysBetween(now, dose.dueDate);
      const key = (suffix) => `${child._id}:${suffix}:${dose._id}`;

      if (diff >= 0 && diff <= 7 && !(await alreadyNotified(key('vaccination_due')))) {
        created.push(
          await createNotification({
            mother,
            child,
            type: 'vaccination_due',
            dedupeKey: key('vaccination_due'),
            ctx: { childName: child.name, vaccine: dose.vaccine, date: dose.dueDate },
          })
        );
      } else if (diff < 0 && !(await alreadyNotified(key('vaccination_overdue')))) {
        created.push(
          await createNotification({
            mother,
            child,
            type: 'vaccination_overdue',
            dedupeKey: key('vaccination_overdue'),
            ctx: { childName: child.name, vaccine: dose.vaccine, date: dose.dueDate },
          })
        );
      }
    }

    const childAgeMonths = ageInMonths(child.dateOfBirth, now);
    if (childAgeMonths <= GROWTH_CHECKUP_MAX_AGE_MONTHS) {
      const lastEntry = child.growthHistory[child.growthHistory.length - 1];
      const baseDate = lastEntry ? lastEntry.date : child.dateOfBirth;
      const dueDate = addMonths(baseDate, GROWTH_CHECKUP_INTERVAL_MONTHS);
      const diff = daysBetween(now, dueDate);
      // Bucket by month so this fires once per due window, not once per day.
      const monthBucket = new Date(dueDate).toISOString().slice(0, 7);
      const key = `${child._id}:growth_check_due:${monthBucket}`;

      if (diff >= 0 && diff <= 7 && !(await alreadyNotified(key))) {
        created.push(
          await createNotification({
            mother,
            child,
            type: 'growth_check_due',
            dedupeKey: key,
            ctx: { childName: child.name, date: dueDate },
          })
        );
      }
    }
  }

  return created.filter(Boolean);
}

// Re-attempts delivery of an existing notification (e.g. a CHW clicking
// "resend" on one that failed, or wants it sent again). Reuses its
// already-built message rather than regenerating it.
async function resendNotification(notification, mother) {
  const result = await sendSms({ to: mother.contactNumber, message: notification.message });
  notification.status = result.success ? 'sent' : 'failed';
  if (result.success) {
    notification.sentAt = new Date();
    notification.error = undefined;
  } else {
    notification.error = result.error;
  }
  await notification.save();
  return notification;
}

module.exports = {
  notifyAncUpcoming,
  notifyAncVisitLogged,
  notifyBirthRecorded,
  notifyGrowthRecorded,
  notifyVaccinationRecorded,
  notifyDangerSign,
  runDueScan,
  resendNotification,
};
