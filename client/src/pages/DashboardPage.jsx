import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getReminders } from '../services/remindersService';
import ReminderList from '../components/ReminderList';

function timeOfDayGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getReminders()
      .then(setReminders)
      .catch((err) => setError(err.response?.data?.error || 'Failed to load reminders'));
  }, []);

  const firstName = user?.name?.split(' ')[0];
  const allCaughtUp = reminders && reminders.overdue.length === 0 && reminders.upcoming.length === 0;

  return (
    <div className="dashboard-page">
      <h1>
        {timeOfDayGreeting()}
        {firstName ? `, ${firstName}` : ''}
      </h1>
      <p>{allCaughtUp ? "You're all caught up." : "Here's what needs your attention today."}</p>

      {error && <p className="error">{error}</p>}
      {!error && !reminders && <p>Loading…</p>}

      {reminders && (
        <>
          <ReminderList title="Overdue" items={reminders.overdue} tone="danger" />
          <ReminderList title="Upcoming — next 7 days" items={reminders.upcoming} tone="accent" />
        </>
      )}
    </div>
  );
}
