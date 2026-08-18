import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getChildById, completeVaccination } from '../services/childService';
import { formatDate } from '../utils/formatDate';
import { riskLabels } from '../utils/growth';
import { useSync } from '../context/SyncContext';

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export default function ChildProfilePage() {
  const { id } = useParams();
  const { submitGrowthEntry } = useSync();
  const [child, setChild] = useState(null);
  const [error, setError] = useState('');

  const [date, setDate] = useState(todayInputValue());
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formErrorDetails, setFormErrorDetails] = useState([]);
  const [formNotice, setFormNotice] = useState('');
  const [lastRisks, setLastRisks] = useState([]);

  const [completingId, setCompletingId] = useState(null);
  const [vaxError, setVaxError] = useState('');

  useEffect(() => {
    getChildById(id)
      .then(setChild)
      .catch((err) => setError(err.response?.data?.error || 'Failed to load child'));
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setFormErrorDetails([]);
    setFormNotice('');
    setSubmitting(true);
    try {
      const payload = { date, weight: Number(weight) };
      if (height.trim()) payload.height = Number(height);

      const result = await submitGrowthEntry(id, payload);
      if (result.queued) {
        // The underweight/stunting/wasting check runs server-side, so a
        // queued entry can't be flagged until it actually syncs.
        setFormNotice("Saved offline — this entry will sync automatically once you're back online.");
        setLastRisks([]);
      } else {
        setChild(result.child);
        setLastRisks(riskLabels(result.assessment));
      }
      setWeight('');
      setHeight('');
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to log growth entry');
      setFormErrorDetails(err.response?.data?.details || []);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCompleteVaccination(vaccineId) {
    setVaxError('');
    setCompletingId(vaccineId);
    try {
      const result = await completeVaccination(id, vaccineId);
      setChild(result.child);
    } catch (err) {
      setVaxError(err.response?.data?.error || 'Failed to mark vaccination as given');
    } finally {
      setCompletingId(null);
    }
  }

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

      {lastRisks.length > 0 && (
        <div className="warning-banner" role="alert">
          ⚠ This entry flags: {lastRisks.join(', ')}. Consider referring for further assessment.
        </div>
      )}

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

        <form className="log-visit-form" onSubmit={handleSubmit}>
          <h3>Log a weight/height entry</h3>
          <label>
            Date
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <label>
            Weight (kg)
            <input
              type="number"
              step="0.1"
              min="0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
            />
          </label>
          <label>
            Height (cm, optional)
            <input
              type="number"
              step="0.1"
              min="0"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </label>

          {formError && <p className="error">{formError}</p>}
          {formErrorDetails.length > 0 && (
            <ul className="error error-list">
              {formErrorDetails.map((d, i) => (
                <li key={i}>
                  {d.field}: {d.message}
                </li>
              ))}
            </ul>
          )}
          {formNotice && <p className="notice">{formNotice}</p>}

          <button type="submit" disabled={submitting}>
            {submitting ? 'Logging…' : 'Log entry'}
          </button>
        </form>
      </section>

      <section>
        <h2>Vaccinations</h2>
        {vaxError && <p className="error">{vaxError}</p>}
        <ul className="vaccination-list">
          {child.vaccinationRecord.map((dose) => (
            <li key={dose._id}>
              <span>
                {dose.vaccine} — due {formatDate(dose.dueDate)}
                {dose.completed && ` — given ${formatDate(dose.completedDate)}`}
              </span>
              {!dose.completed && (
                <button
                  type="button"
                  onClick={() => handleCompleteVaccination(dose._id)}
                  disabled={completingId === dose._id}
                >
                  {completingId === dose._id ? 'Saving…' : 'Mark given'}
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
