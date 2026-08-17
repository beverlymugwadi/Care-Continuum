import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getMotherById } from '../services/motherService';
import { formatDate } from '../utils/formatDate';

export default function MotherProfilePage() {
  const { id } = useParams();
  const [mother, setMother] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getMotherById(id)
      .then(setMother)
      .catch((err) => setError(err.response?.data?.error || 'Failed to load mother'));
  }, [id]);

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
          <h2>ANC schedule</h2>
          <ul>
            {mother.ancSchedule.map((contact) => (
              <li key={contact.contactNumber}>
                Contact {contact.contactNumber} (week {contact.gestationalWeek}) —{' '}
                {formatDate(contact.date)}
                {contact.contactNumber <= completedContacts ? ' — done' : ''}
              </li>
            ))}
          </ul>
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
    </div>
  );
}
