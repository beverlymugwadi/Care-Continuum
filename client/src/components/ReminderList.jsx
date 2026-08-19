import { Link } from 'react-router-dom';
import { formatDate } from '../utils/formatDate';
import Icon from './Icon';

// Picks the icon square's icon from the reminder's own type string --
// vaccination/growth items are about the child, everything else is an
// ANC visit reminder about the mother.
function iconFor(type = '') {
  if (type.includes('vaccin')) return 'vial';
  if (type.includes('growth')) return 'chart';
  return 'calendar';
}

/**
 * Renders one urgency group (e.g. "Overdue" or "Upcoming") from the
 * /api/reminders response:
 *   [{ type, motherId, motherName, childId?, childName?, detail, dueDate }]
 * `tone` ("danger" | "accent") drives the icon square / count badge color
 * so overdue and upcoming read distinctly at a glance. Shared between
 * DashboardPage and AlertsPage so both stay in sync.
 */
export default function ReminderList({ title, items, tone = 'accent' }) {
  return (
    <section className={`reminder-list ${tone === 'danger' ? 'reminder-list--danger' : ''}`}>
      <h2>
        {title}
        <span className="status-badge">{items.length}</span>
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
                <Link to={to} className="list-row">
                  <span className={`icon-square icon-square--${tone === 'danger' ? 'danger' : 'upcoming'}`}>
                    <Icon name={iconFor(item.type)} size={17} color="#fff" />
                  </span>
                  <span className="list-row-text">
                    <strong>{name}</strong>
                    <span>{item.detail}</span>
                  </span>
                  <span className={`list-row-meta ${tone === 'danger' ? 'list-row-meta--danger' : ''}`}>
                    {formatDate(item.dueDate)}
                  </span>
                  <Icon name="chevronRight" size={16} color="#8B87A0" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
