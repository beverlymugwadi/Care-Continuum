import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getReminders } from '../services/remindersService';

export default function DashboardPage() {
  const { user } = useAuth();
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    getReminders()
      .then((data) => setCounts(data.counts))
      .catch(() => setCounts(null));
  }, []);

  return (
    <div className="dashboard-page">
      <h1>Welcome, {user?.name}</h1>
      <div className="dashboard-cards">
        <Link to="/mothers" className="card">
          <h2>Mothers</h2>
          <p>View and manage your assigned mothers.</p>
        </Link>
        <Link to="/alerts" className="card">
          <h2>Alerts</h2>
          <p>
            {counts
              ? `${counts.overdue} overdue, ${counts.upcoming} upcoming`
              : 'View overdue and upcoming visits.'}
          </p>
        </Link>
      </div>
    </div>
  );
}
