import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand-mark">
            <Icon name="baby" size={17} color="#fff" />
          </span>
          <span className="auth-brand-name">Care Continuum</span>
        </div>

        <h1>Create your account</h1>
        <p>Join Care Continuum to start tracking mothers and children in your community.</p>

        <form onSubmit={handleSubmit}>
          <label>
            Name
            <input type="text" name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Register'}
          </button>
        </form>
        <p>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
