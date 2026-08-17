/**
 * Standard EPI (Expanded Programme on Immunization) infant schedule,
 * following the generic WHO-recommended vaccine timing used by most
 * national programs (exact vaccines/timing vary slightly by country --
 * confirm against the local Ministry of Health EPI schedule before using
 * this for anything beyond a general reminder tool).
 *
 * Each entry's due date is calculated from the child's date of birth using
 * either a week offset (for the early-infancy doses, which are scheduled by
 * week) or a month offset (for the later doses, scheduled by month).
 */
const EPI_SCHEDULE = [
  { vaccine: 'BCG', offset: { weeks: 0 } },
  { vaccine: 'OPV 0 (birth dose)', offset: { weeks: 0 } },
  { vaccine: 'OPV 1', offset: { weeks: 6 } },
  { vaccine: 'Pentavalent 1', offset: { weeks: 6 } },
  { vaccine: 'PCV 1', offset: { weeks: 6 } },
  { vaccine: 'Rotavirus 1', offset: { weeks: 6 } },
  { vaccine: 'OPV 2', offset: { weeks: 10 } },
  { vaccine: 'Pentavalent 2', offset: { weeks: 10 } },
  { vaccine: 'PCV 2', offset: { weeks: 10 } },
  { vaccine: 'Rotavirus 2', offset: { weeks: 10 } },
  { vaccine: 'OPV 3', offset: { weeks: 14 } },
  { vaccine: 'Pentavalent 3', offset: { weeks: 14 } },
  { vaccine: 'PCV 3', offset: { weeks: 14 } },
  { vaccine: 'IPV', offset: { weeks: 14 } },
  { vaccine: 'Measles 1', offset: { months: 9 } },
  { vaccine: 'Measles 2', offset: { months: 18 } },
];

function addOffset(baseDate, offset) {
  const date = new Date(baseDate);
  if (offset.weeks) date.setDate(date.getDate() + offset.weeks * 7);
  if (offset.months) date.setMonth(date.getMonth() + offset.months);
  return date;
}

/**
 * Given a date of birth, build the full recommended vaccination schedule
 * with due dates, each starting uncompleted.
 *
 * @param {Date|string} dateOfBirth
 * @returns {{ vaccine: string, dueDate: Date, completed: boolean }[]}
 */
function calculateVaccinationSchedule(dateOfBirth) {
  return EPI_SCHEDULE.map(({ vaccine, offset }) => ({
    vaccine,
    dueDate: addOffset(dateOfBirth, offset),
    completed: false,
  }));
}

module.exports = { calculateVaccinationSchedule, EPI_SCHEDULE };
