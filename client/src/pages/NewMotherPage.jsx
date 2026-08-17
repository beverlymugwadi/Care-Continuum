import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createMother } from '../services/motherService';

const initialForm = {
  name: '',
  age: '',
  contactNumber: '',
  location: '',
  expectedDueDate: '',
};

export default function NewMotherPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [details, setDetails] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setDetails([]);
    setSubmitting(true);
    try {
      const mother = await createMother({ ...form, age: Number(form.age) });
      navigate(`/mothers/${mother._id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register mother');
      setDetails(err.response?.data?.details || []);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="form-page">
      <h1>Register a mother</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Name
          <input type="text" name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label>
          Age
          <input
            type="number"
            name="age"
            min="0"
            value={form.age}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Contact number
          <input
            type="tel"
            name="contactNumber"
            value={form.contactNumber}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Location
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Expected due date
          <input
            type="date"
            name="expectedDueDate"
            value={form.expectedDueDate}
            onChange={handleChange}
            required
          />
        </label>

        {error && <p className="error">{error}</p>}
        {details.length > 0 && (
          <ul className="error error-list">
            {details.map((d, i) => (
              <li key={i}>
                {d.field}: {d.message}
              </li>
            ))}
          </ul>
        )}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Registering…' : 'Register mother'}
        </button>
      </form>
      <p>
        <Link to="/mothers">Back to mothers list</Link>
      </p>
    </div>
  );
}
