import { formatDate } from '../utils/formatDate';

/**
 * Renders one urgency group (e.g. "Overdue" or "Upcoming") from the
 * /api/reminders response: [{ type, motherName?, childName?, detail, dueDate }].
 * Shared between DashboardPage and AlertsPage so both stay in sync.
 */
export default function ReminderList({ title, items }) {
  return (
    <section>
      <h2>
        {title} ({items.length})
      </h2>
      {items.length === 0 ? (
        <p className="empty">Nothing here.</p>
      ) : (
        <ul>
          {items.map((item, i) => (
            <li key={i}>
              <strong>{item.motherName || item.childName}</strong> — {item.detail} —{' '}
              {formatDate(item.dueDate)}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
