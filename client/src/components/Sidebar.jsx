import { NavLink } from 'react-router-dom';
import Icon from './Icon';

const links = [
  { to: '/', label: 'Dashboard', end: true, icon: 'home' },
  { to: '/mothers', label: 'Mothers', icon: 'users' },
  { to: '/alerts', label: 'Alerts', icon: 'bell' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <nav>
        <ul>
          {links.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} end={link.end}>
                <Icon name={link.icon} size={20} />
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
