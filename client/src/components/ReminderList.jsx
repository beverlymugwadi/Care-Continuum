import { Link } from 'react-router-dom';
import { formatDate } from '../utils/formatDate';

/**
 * Renders one urgency group (e.g. "Overdue" or "Upcoming") from the
 * /api/reminders response:
 *   [{ type, motherId, motherName, childId?, childName?, detail, dueDate }]
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
          {items.map((item, i) => {
            // Vaccination/growth-checkup items are about the child; ANC
            // visit items only have a mother (no childId).
            const to = item.childId ? `/children/${item.childId}` : `/mothers/${item.motherId}`;
            const name = item.childName || item.motherName;
            return (
              <li key={i}>
                <Link to={to}>
                  <strong>{name}</strong>
                </Link>{' '}
                — {item.detail} — {formatDate(item.dueDate)}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
