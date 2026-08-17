import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getChildById } from '../services/childService';
import { formatDate } from '../utils/formatDate';
import { riskLabels } from '../utils/growth';

export default function ChildProfilePage() {
  const { id } = useParams();
  const [child, setChild] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getChildById(id)
      .then(setChild)
      .catch((err) => setError(err.response?.data?.error || 'Failed to load child'));
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!child) return <p>Loading…</p>;

  return (
    <div className="profile-page">
      <h1>{child.name}</h1>
      <dl>
        <dt>Date of birth</dt>
        <dd>{formatDate(child.dateOfBirth)}</dd>
        <dt>Sex</dt>
        <dd>{child.sex}</dd>
      </dl>

      <section>
        <h2>Growth history</h2>
        {child.growthHistory.length === 0 ? (
          <p className="empty">No growth entries yet.</p>
        ) : (
          <ul>
            {child.growthHistory.map((entry, i) => {
              const labels = riskLabels(entry.assessment);
              return (
                <li key={i}>
                  {formatDate(entry.date)} — {entry.weight}kg
                  {entry.height ? `, ${entry.height}cm` : ''}
                  {labels.length > 0 && <span className="error"> — {labels.join(', ')}</span>}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h2>Vaccinations</h2>
        <ul>
          {child.vaccinationRecord.map((dose) => (
            <li key={dose._id}>
              {dose.vaccine} — due {formatDate(dose.dueDate)}
              {dose.completed ? ` — given ${formatDate(dose.completedDate)}` : ' — pending'}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
