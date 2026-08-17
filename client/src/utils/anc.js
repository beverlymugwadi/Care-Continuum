/**
 * Summarizes a mother's ANC progress from her ancSchedule/ancVisitHistory
 * (see the API's Mother model) into a short status label for display.
 * Contacts are treated as fulfilled in order, same logic the backend's
 * reminders endpoint uses: the Nth scheduled contact counts as done once N
 * visits have been logged.
 */
export function getAncStatus(mother) {
  if (mother.status === 'delivered') {
    return { label: 'Delivered', overdue: false };
  }

  const total = mother.ancSchedule.length;
  const completed = mother.ancVisitHistory.length;
  const nextContact = mother.ancSchedule[completed];

  if (!nextContact) {
    return { label: `${completed}/${total} ANC visits — all done`, overdue: false };
  }

  const overdue = new Date(nextContact.date) < new Date();
  return {
    label: `${completed}/${total} ANC visits${overdue ? ' — overdue' : ''}`,
    overdue,
  };
}
