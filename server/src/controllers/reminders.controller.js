const Mother = require('../models/Mother');
const Child = require('../models/Child');
const asyncHandler = require('../utils/asyncHandler');
const { addMonths, ageInMonths } = require('../utils/dateMath');

const REMINDER_WINDOW_DAYS = 7;

// Routine growth checkups have no stored schedule of their own (unlike ANC
// contacts and vaccinations, which are generated and saved on the record).
// As a simplification, "due" here is computed on the fly as this many
// months after the last logged growth entry (or date of birth, if none has
// been logged yet). Adjust this if your program follows a different cadence.
const GROWTH_CHECKUP_INTERVAL_MONTHS = 3;
// Stop generating growth-checkup reminders past this age -- beyond this the
// WHO growth reference data (see whoGrowthReference.js) no longer applies.
const GROWTH_CHECKUP_MAX_AGE_MONTHS = 60;

// Classifies a due date as 'overdue' (already past), 'upcoming' (within the
// reminder window), or null (too far in the future to report yet).
function classify(dueDate, now, windowEnd) {
  const d = new Date(dueDate);
  if (d < now) return 'overdue';
  if (d <= windowEnd) return 'upcoming';
  return null;
}

// GET /reminders
// Returns overdue/upcoming ANC visits, growth checkups, and vaccinations
// across every mother assigned to the logged-in CHW and their children.
exports.getReminders = asyncHandler(async (req, res) => {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const mothers = await Mother.find({ chw: req.user._id });
  const motherIds = mothers.map((m) => m._id);
  const motherNameById = new Map(mothers.map((m) => [m._id.toString(), m.name]));

  const children = await Child.find({ motherId: { $in: motherIds } });

  const overdue = [];
  const upcoming = [];

  function addReminder(status, item) {
    if (status === 'overdue') overdue.push(item);
    else if (status === 'upcoming') upcoming.push(item);
  }

  // --- ANC visits ---
  // A mother's ANC contacts are consumed in order by her logged visits:
  // the Nth scheduled contact is treated as done once N visits have been
  // logged in ancVisitHistory. Only her next not-yet-done contact (if any)
  // is reported.
  mothers.forEach((mother) => {
    if (mother.status === 'delivered') return;

    const completedContacts = mother.ancVisitHistory.length;
    const pendingContacts = mother.ancSchedule.slice(completedContacts);

    pendingContacts.forEach((contact) => {
      const status = classify(contact.date, now, windowEnd);
      if (!status) return;
      addReminder(status, {
        type: 'anc_visit',
        status,
        dueDate: contact.date,
        motherId: mother._id,
        motherName: mother.name,
        detail: `ANC contact ${contact.contactNumber} (week ${contact.gestationalWeek})`,
      });
    });
  });

  // --- Growth checkups & vaccinations ---
  children.forEach((child) => {
    const motherName = motherNameById.get(child.motherId.toString());

    const childAgeMonths = ageInMonths(child.dateOfBirth, now);
    if (childAgeMonths <= GROWTH_CHECKUP_MAX_AGE_MONTHS) {
      const lastEntry = child.growthHistory[child.growthHistory.length - 1];
      const baseDate = lastEntry ? lastEntry.date : child.dateOfBirth;
      const nextDue = addMonths(baseDate, GROWTH_CHECKUP_INTERVAL_MONTHS);
      const status = classify(nextDue, now, windowEnd);
      if (status) {
        addReminder(status, {
          type: 'growth_checkup',
          status,
          dueDate: nextDue,
          childId: child._id,
          childName: child.name,
          motherId: child.motherId,
          motherName,
          detail: 'Routine growth checkup',
        });
      }
    }

    child.vaccinationRecord.forEach((dose) => {
      if (dose.completed) return;
      const status = classify(dose.dueDate, now, windowEnd);
      if (!status) return;
      addReminder(status, {
        type: 'vaccination',
        status,
        dueDate: dose.dueDate,
        childId: child._id,
        childName: child.name,
        motherId: child.motherId,
        motherName,
        detail: `Vaccination: ${dose.vaccine}`,
      });
    });
  });

  overdue.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  upcoming.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  res.status(200).json({
    generatedAt: now,
    windowDays: REMINDER_WINDOW_DAYS,
    counts: { overdue: overdue.length, upcoming: upcoming.length },
    overdue,
    upcoming,
  });
});
