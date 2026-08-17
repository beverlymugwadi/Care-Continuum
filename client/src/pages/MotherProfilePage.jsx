import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getMotherById, updateMother } from '../services/motherService';
import { formatDate } from '../utils/formatDate';
import { PREGNANCY_DANGER_SIGNS } from '../data/dangerSigns';

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

// Same "contacts fulfilled in order" logic used elsewhere in the app
// (utils/anc.js, the backend's reminders endpoint): the Nth scheduled
// contact counts as done once N visits have been logged.
function ancContactStatus(contact, completedCount) {
  if (contact.contactNumber <= completedCount) return 'Completed';
  if (new Date(contact.date) < new Date()) return 'Missed';
  return 'Upcoming';
}

export default function MotherProfilePage() {
  const { id } = useParams();
  const [mother, setMother] = useState(null);
  const [error, setError] = useState('');

  const [visitDate, setVisitDate] = useState(todayInputValue());
  const [visitNotes, setVisitNotes] = useState('');
  const [logging, setLogging] = useState(false);
  const [logError, setLogError] = useState('');

  useEffect(() => {
    getMotherById(id)
      .then(setMother)
      .catch((err) => setError(err.response?.data?.error || 'Failed to load mother'));
  }, [id]);

  async function handleLogVisit(e) {
    e.preventDefault();
    setLogError('');
    setLogging(true);
    try {
      // The API replaces ancVisitHistory wholesale on PUT, so we send the
      // existing entries plus the new one, not just the new one.
      const newEntry = { date: visitDate };
      if (visitNotes.trim()) newEntry.notes = visitNotes.trim();

      const updated = await updateMother(id, {
        ancVisitHistory: [...mother.ancVisitHistory, newEntry],
      });
      setMother(updated);
      setVisitNotes('');
    } catch (err) {
      setLogError(err.response?.data?.error || 'Failed to log visit');
    } finally {
      setLogging(false);
    }
  }

  if (error) return <p className="error">{error}</p>;
  if (!mother) return <p>Loading…</p>;

  const completedContacts = mother.ancVisitHistory.length;

  return (
    <div className="profile-page">
      <h1>{mother.name}</h1>
      <dl>
        <dt>Age</dt>
        <dd>{mother.age}</dd>
        <dt>Contact number</dt>
        <dd>{mother.contactNumber}</dd>
        <dt>Location</dt>
        <dd>{mother.location}</dd>
        <dt>Status</dt>
        <dd>{mother.status}</dd>
        <dt>Expected due date</dt>
        <dd>{formatDate(mother.expectedDueDate)}</dd>
        <dt>Registered</dt>
        <dd>{formatDate(mother.registrationDate)}</dd>
      </dl>

      {mother.status !== 'delivered' && (
        <section>
          <h2>ANC visit schedule</h2>
          <ul className="anc-schedule">
            {mother.ancSchedule.map((contact) => {
              const status = ancContactStatus(contact, completedContacts);
              return (
                <li key={contact.contactNumber}>
                  Contact {contact.contactNumber} (week {contact.gestationalWeek}) —{' '}
                  {formatDate(contact.date)} —{' '}
                  <span className={`status-badge status-${status.toLowerCase()}`}>{status}</span>
                </li>
              );
            })}
          </ul>

          <form className="log-visit-form" onSubmit={handleLogVisit}>
            <h3>Log a completed ANC visit</h3>
            <label>
              Visit date
              <input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                required
              />
            </label>
            <label>
              Notes (optional)
              <input
                type="text"
                value={visitNotes}
                onChange={(e) => setVisitNotes(e.target.value)}
                placeholder="e.g. BP normal, iron supplements given"
              />
            </label>
            {logError && <p className="error">{logError}</p>}
            <button type="submit" disabled={logging}>
              {logging ? 'Logging…' : 'Log visit'}
            </button>
          </form>
        </section>
      )}

      {mother.status === 'delivered' && mother.birthDetails && (
        <section>
          <h2>Birth details</h2>
          <dl>
            <dt>Date</dt>
            <dd>{formatDate(mother.birthDetails.date)}</dd>
            <dt>Weight</dt>
            <dd>{mother.birthDetails.weight} kg</dd>
            {mother.birthDetails.complications && (
              <>
                <dt>Complications</dt>
                <dd>{mother.birthDetails.complications}</dd>
              </>
            )}
          </dl>
        </section>
      )}

      <section>
        <h2>Danger signs — seek care immediately</h2>
        <p className="note">
          If the mother reports any of the following, refer her for urgent care right away. This
          list is general reference only — follow your program's official protocol.
        </p>
        <ul>
          {PREGNANCY_DANGER_SIGNS.map((sign) => (
            <li key={sign}>{sign}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
