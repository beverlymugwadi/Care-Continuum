import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';

// Only ever rendered inside the authenticated app shell (see Layout.jsx),
// so it doesn't need a logged-out state.
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const initials = (user?.name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="navbar-brand-mark">
          <Icon name="heart" size={16} color="#fff" />
        </span>
        Care Continuum
      </Link>
      <div className="navbar-actions">
        <span className="navbar-user">{user?.name}</span>
        <span className="navbar-avatar">{initials}</span>
        <button type="button" onClick={handleLogout} aria-label="Log out">
          <Icon name="logout" size={16} />
        </button>
      </div>
    </header>
  );
}
