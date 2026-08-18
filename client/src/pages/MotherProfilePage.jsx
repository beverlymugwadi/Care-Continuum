import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMotherById, recordBirth } from '../services/motherService';
import { formatDate } from '../utils/formatDate';
import { PREGNANCY_DANGER_SIGNS } from '../data/dangerSigns';
import { useSync } from '../context/SyncContext';

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
  const navigate = useNavigate();
  const { submitAncVisit } = useSync();
  const [mother, setMother] = useState(null);
  const [error, setError] = useState('');

  const [visitDate, setVisitDate] = useState(todayInputValue());
  const [visitNotes, setVisitNotes] = useState('');
  const [logging, setLogging] = useState(false);
  const [logError, setLogError] = useState('');
  const [logNotice, setLogNotice] = useState('');

  const [showBirthForm, setShowBirthForm] = useState(false);
  const [birthDate, setBirthDate] = useState(todayInputValue());
  const [birthWeight, setBirthWeight] = useState('');
  const [sex, setSex] = useState('');
  const [childName, setChildName] = useState('');
  const [complications, setComplications] = useState('');
  const [birthSubmitting, setBirthSubmitting] = useState(false);
  const [birthError, setBirthError] = useState('');
  const [birthErrorDetails, setBirthErrorDetails] = useState([]);

  useEffect(() => {
    getMotherById(id)
      .then(setMother)
      .catch((err) => setError(err.response?.data?.error || 'Failed to load mother'));
  }, [id]);

  async function handleLogVisit(e) {
    e.preventDefault();
    setLogError('');
    setLogNotice('');
    setLogging(true);
    try {
      const newEntry = { date: visitDate };
      if (visitNotes.trim()) newEntry.notes = visitNotes.trim();

      const result = await submitAncVisit(id, newEntry);
      if (result.queued) {
        setLogNotice("Saved offline — this visit will sync automatically once you're back online.");
      } else {
        setMother(result.mother);
      }
      setVisitNotes('');
    } catch (err) {
      setLogError(err.response?.data?.error || 'Failed to log visit');
    } finally {
      setLogging(false);
    }
  }

  async function handleRecordBirth(e) {
    e.preventDefault();
    setBirthError('');
    setBirthErrorDetails([]);
    setBirthSubmitting(true);
    try {
      const payload = { date: birthDate, weight: Number(birthWeight), sex };
      if (childName.trim()) payload.childName = childName.trim();
      if (complications.trim()) payload.complications = complications.trim();

      const result = await recordBirth(id, payload);
      navigate(`/children/${result.child._id}`);
    } catch (err) {
      setBirthError(err.response?.data?.error || 'Failed to record birth');
      setBirthErrorDetails(err.response?.data?.details || []);
    } finally {
      setBirthSubmitting(false);
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
            {logNotice && <p className="notice">{logNotice}</p>}
            <button type="submit" disabled={logging}>
              {logging ? 'Logging…' : 'Log visit'}
            </button>
          </form>
        </section>
      )}

      {mother.status !== 'delivered' && (
        <section>
          <h2>Birth</h2>
          {!showBirthForm ? (
            <button type="button" onClick={() => setShowBirthForm(true)}>
              Record birth
            </button>
          ) : (
            <form className="log-visit-form" onSubmit={handleRecordBirth}>
              <h3>Record birth</h3>
              <label>
                Birth date
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                />
              </label>
              <label>
                Weight (kg)
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={birthWeight}
                  onChange={(e) => setBirthWeight(e.target.value)}
                  required
                />
              </label>
              <label>
                Sex
                <select value={sex} onChange={(e) => setSex(e.target.value)} required>
                  <option value="" disabled>
                    Select…
                  </option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </label>
              <label>
                Child's name (optional)
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder={`Baby of ${mother.name}`}
                />
              </label>
              <label>
                Complications (optional)
                <input
                  type="text"
                  value={complications}
                  onChange={(e) => setComplications(e.target.value)}
                  placeholder="e.g. none, prolonged labor"
                />
              </label>

              {birthError && <p className="error">{birthError}</p>}
              {birthErrorDetails.length > 0 && (
                <ul className="error error-list">
                  {birthErrorDetails.map((d, i) => (
                    <li key={i}>
                      {d.field}: {d.message}
                    </li>
                  ))}
                </ul>
              )}

              <div className="form-actions">
                <button type="submit" disabled={birthSubmitting}>
                  {birthSubmitting ? 'Recording…' : 'Save birth record'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBirthForm(false)}
                  disabled={birthSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
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
