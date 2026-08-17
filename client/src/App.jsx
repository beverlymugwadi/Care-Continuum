import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MothersListPage from './pages/MothersListPage';
import MotherProfilePage from './pages/MotherProfilePage';
import ChildProfilePage from './pages/ChildProfilePage';
import AlertsPage from './pages/AlertsPage';
import './App.css';

function App() {
  return (
    <Routes>
      {/* Bare auth pages -- no navbar/sidebar chrome. */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Everything else requires auth and lives inside the app shell. */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/mothers" element={<MothersListPage />} />
          <Route path="/mothers/:id" element={<MotherProfilePage />} />
          <Route path="/children/:id" element={<ChildProfilePage />} />
          <Route path="/alerts" element={<AlertsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
