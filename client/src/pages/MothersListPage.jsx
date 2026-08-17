import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMothers } from '../services/motherService';
import { formatDate } from '../utils/formatDate';

export default function MothersListPage() {
  const [mothers, setMothers] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getMothers()
      .then(setMothers)
      .catch((err) => setError(err.response?.data?.error || 'Failed to load mothers'));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!mothers) return <p>Loading…</p>;

  return (
    <div className="mothers-list-page">
      <h1>Mothers</h1>
      {mothers.length === 0 ? (
        <p className="empty">No mothers registered yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Status</th>
              <th>Expected due date</th>
            </tr>
          </thead>
          <tbody>
            {mothers.map((mother) => (
              <tr key={mother._id}>
                <td>
                  <Link to={`/mothers/${mother._id}`}>{mother.name}</Link>
                </td>
                <td>{mother.location}</td>
                <td>{mother.status}</td>
                <td>{formatDate(mother.expectedDueDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
