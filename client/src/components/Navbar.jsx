import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <Link to="/">Care Continuum</Link>
      {isAuthenticated ? (
        <div className="navbar-actions">
          <span>{user?.name}</span>
          <button type="button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      ) : (
        <div className="navbar-actions">
          <Link to="/login">Log in</Link>
          <Link to="/register">Register</Link>
        </div>
      )}
    </nav>
  );
}
