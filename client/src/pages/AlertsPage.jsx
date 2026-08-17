import { useEffect, useState } from 'react';
import { getReminders } from '../services/remindersService';
import { formatDate } from '../utils/formatDate';

function ReminderList({ title, items }) {
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

export default function AlertsPage() {
  const [reminders, setReminders] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getReminders()
      .then(setReminders)
      .catch((err) => setError(err.response?.data?.error || 'Failed to load alerts'));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!reminders) return <p>Loading…</p>;

  return (
    <div className="alerts-page">
      <h1>Alerts</h1>
      <ReminderList title="Overdue" items={reminders.overdue} />
      <ReminderList title="Upcoming (next 7 days)" items={reminders.upcoming} />
    </div>
  );
}
