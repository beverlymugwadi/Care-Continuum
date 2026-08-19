import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMothers } from '../services/motherService';
import { formatDate, daysUntil } from '../utils/formatDate';
import { getAncStatus } from '../utils/anc';
import Icon from '../components/Icon';
import ProgressBar from '../components/ProgressBar';

export default function MothersListPage() {
  const [mothers, setMothers] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getMothers()
      .then(setMothers)
      .catch((err) => setError(err.response?.data?.error || 'Failed to load mothers'));
  }, []);

  const filtered = useMemo(() => {
    if (!mothers) return [];
    const query = search.trim().toLowerCase();
    if (!query) return mothers;
    return mothers.filter((mother) => mother.name.toLowerCase().includes(query));
  }, [mothers, search]);

  if (error) return <p className="error">{error}</p>;
  if (!mothers) return <p>Loading…</p>;

  return (
    <div className="mothers-list-page">
      <div className="page-header">
        <div>
          <h1>Mothers</h1>
          {mothers.length > 0 && <p>{mothers.length} registered</p>}
        </div>
        <Link to="/mothers/new" className="button-link">
          <Icon name="plus" size={16} color="#fff" />
          Register mother
        </Link>
      </div>

      <input
        type="search"
        className="search-input"
        placeholder="Search by name…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search mothers by name"
      />

      {filtered.length === 0 ? (
        <p className="empty">
          {mothers.length === 0 ? 'No mothers registered yet.' : 'No mothers match your search.'}
        </p>
      ) : (
        <div className="mother-cards">
          {filtered.map((mother) => {
            const anc = getAncStatus(mother);
            const delivered = mother.status === 'delivered';
            const completed = mother.ancVisitHistory.length;
            const total = mother.ancSchedule.length;
            const badgeTone = delivered ? 'status-completed' : anc.overdue ? 'status-missed' : 'status-upcoming';
            const badgeLabel = delivered ? 'Delivered' : anc.overdue ? 'Overdue' : 'Upcoming';
            const days = daysUntil(mother.expectedDueDate);

            return (
              <Link to={`/mothers/${mother._id}`} key={mother._id} className="mother-card">
                <div className="mother-card-header">
                  <h2>{mother.name}</h2>
                  <span className={`status-badge ${badgeTone}`}>{badgeLabel}</span>
                </div>

                <div className="mother-card-location">
                  <Icon name="pin" size={14} />
                  {mother.location}
                </div>

                <div className="mother-card-progress">
                  <div className="mother-card-progress-label">
                    <span>ANC visits</span>
                    <span>
                      {completed} of {total}
                    </span>
                  </div>
                  <ProgressBar value={completed} max={total} />
                </div>

                <div className="mother-card-footer">
                  <span>
                    {delivered ? 'Delivered' : 'Due'} {formatDate(delivered ? mother.birthDetails?.date : mother.expectedDueDate)}
                  </span>
                  {!delivered && days !== null && (
                    <strong>{days >= 0 ? `${days} days to go` : `${Math.abs(days)} days overdue`}</strong>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
