function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function ageInMonths(dateOfBirth, atDate) {
  const dob = new Date(dateOfBirth);
  const ref = new Date(atDate);
  let months = (ref.getFullYear() - dob.getFullYear()) * 12 + (ref.getMonth() - dob.getMonth());
  if (ref.getDate() < dob.getDate()) months -= 1;
  return Math.max(0, months);
}

// Whole-day difference between two dates, ignoring time-of-day, so a "due
// in 7 days" check fires on the right calendar day regardless of what time
// the scan happens to run. Positive = to is in the future relative to from.
function daysBetween(from, to) {
  const a = new Date(from);
  a.setHours(0, 0, 0, 0);
  const b = new Date(to);
  b.setHours(0, 0, 0, 0);
  return Math.round((b - a) / (24 * 60 * 60 * 1000));
}

module.exports = { addMonths, ageInMonths, daysBetween };
