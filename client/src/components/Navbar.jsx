import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Only ever rendered inside the authenticated app shell (see Layout.jsx),
// so it doesn't need a logged-out state.
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        Care Continuum
      </Link>
      <div className="navbar-actions">
        <span>{user?.name}</span>
        <button type="button" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </header>
  );
}
