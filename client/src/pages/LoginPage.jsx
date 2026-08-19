import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
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
      await login(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand-mark">
            <Icon name="heart" size={17} color="#fff" />
          </span>
          <span className="auth-brand-name">Care Continuum</span>
        </div>

        <h1>Welcome back</h1>
        <p>Log in to continue caring for your mothers and children.</p>

        <form onSubmit={handleSubmit}>
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
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={submitting}>
            {submitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>
        <p>
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
