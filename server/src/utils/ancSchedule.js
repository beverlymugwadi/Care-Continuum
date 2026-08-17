/**
 * WHO ANC visit spacing (WHO 2016 antenatal care model): a minimum of 8
 * contacts, scheduled at these gestational ages (in weeks). Contact 8, at
 * week 40, aligns with the expected due date itself.
 * https://www.who.int/publications/i/item/9789241549912
 */
const WHO_ANC_CONTACT_WEEKS = [12, 20, 26, 30, 34, 36, 38, 40];
const FULL_TERM_WEEKS = 40;

/**
 * Given an expected due date, back-calculate the calendar dates for each
 * recommended WHO ANC contact (assuming the due date corresponds to 40
 * weeks gestation).
 *
 * @param {Date|string} expectedDueDate
 * @returns {{ contactNumber: number, gestationalWeek: number, date: Date }[]}
 */
function calculateAncSchedule(expectedDueDate) {
  const dueDate = new Date(expectedDueDate);
  if (Number.isNaN(dueDate.getTime())) {
    throw new Error('Invalid expectedDueDate provided to calculateAncSchedule');
  }

  return WHO_ANC_CONTACT_WEEKS.map((week, index) => {
    const weeksBeforeDueDate = FULL_TERM_WEEKS - week;
    const date = new Date(dueDate);
    date.setDate(date.getDate() - weeksBeforeDueDate * 7);

    return {
      contactNumber: index + 1,
      gestationalWeek: week,
      date,
    };
  });
}

module.exports = { calculateAncSchedule, WHO_ANC_CONTACT_WEEKS };
