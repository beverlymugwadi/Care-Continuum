import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMothers } from '../services/motherService';
import { formatDate } from '../utils/formatDate';
import { getAncStatus } from '../utils/anc';

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
        <h1>Mothers</h1>
        <Link to="/mothers/new" className="button-link">
          + Register mother
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
            return (
              <Link to={`/mothers/${mother._id}`} key={mother._id} className="mother-card">
                <h2>{mother.name}</h2>
                <p>Due: {formatDate(mother.expectedDueDate)}</p>
                <p className={anc.overdue ? 'error' : ''}>{anc.label}</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
