import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getReminders } from '../services/remindersService';
import ReminderList from '../components/ReminderList';

export default function DashboardPage() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getReminders()
      .then(setReminders)
      .catch((err) => setError(err.response?.data?.error || 'Failed to load reminders'));
  }, []);

  return (
    <div className="dashboard-page">
      <h1>Welcome, {user?.name}</h1>

      {error && <p className="error">{error}</p>}
      {!error && !reminders && <p>Loading…</p>}

      {reminders && (
        <>
          <ReminderList title="Overdue" items={reminders.overdue} />
          <ReminderList title="Upcoming (next 7 days)" items={reminders.upcoming} />
        </>
      )}
    </div>
  );
}
