import { useEffect, useState } from 'react';
import { getReminders } from '../services/remindersService';
import ReminderList from '../components/ReminderList';

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
      <ReminderList title="Overdue" items={reminders.overdue} tone="danger" />
      <ReminderList title="Upcoming — next 7 days" items={reminders.upcoming} tone="accent" />
    </div>
  );
}
