import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

/**
 * App shell for every authenticated page: top navbar + left side menu
 * around the routed page content. Mounted once, above the nested routes
 * (see App.jsx), so it doesn't remount on navigation between pages.
 */
export default function Layout() {
  return (
    <div className="app-shell">
      <Navbar />
      <div className="app-body">
        <Sidebar />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
