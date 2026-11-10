import { useEffect, useMemo, useState } from 'react';
import { HashRouter, Link, Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { api, setCsrf } from './api';
import Dashboard from './Dashboard';
import {
  AiHelpWidget,
  AnalyticsReportsPage,
  AppointmentsPage,
  EmergencyHelpBar,
  EmergencyPage,
  Landing,
  Login,
  PatientRecordsPage,
  Signup,
  TelehealthPage,
  TelemedicineConsultationPage,
} from './pages';

const navByRole = {
  PATIENT: [
    { to: '/', label: 'Home' },
    { to: '/appointments', label: 'Appointments' },
    { to: '/records', label: 'Records' },
    { to: '/telehealth', label: 'Telehealth' },
    { to: '/consultation', label: 'Consultation' },
    { to: '/dashboard', label: 'Dashboard' },
  ],
  DOCTOR: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/appointments', label: 'Appointments' },
    { to: '/records', label: 'Records' },
    { to: '/consultation', label: 'Consultation' },
    { to: '/analytics', label: 'Analytics' },
    { to: '/emergency', label: 'Emergency' },
  ],
  NURSE: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/records', label: 'Records' },
    { to: '/appointments', label: 'Visits' },
    { to: '/telehealth', label: 'Telehealth' },
    { to: '/analytics', label: 'Reports' },
    { to: '/emergency', label: 'Alerts' },
  ],
  PARAMEDIC: [
    { to: '/emergency', label: 'Emergency' },
    { to: '/dashboard', label: 'Operations' },
    { to: '/appointments', label: 'Dispatch' },
    { to: '/telehealth', label: 'Telehealth' },
    { to: '/records', label: 'Vitals' },
  ],
  PHARMACIST: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/records', label: 'Records' },
    { to: '/appointments', label: 'Orders' },
    { to: '/analytics', label: 'Inventory' },
    { to: '/consultation', label: 'Review' },
  ],
  ADMIN: [
    { to: '/dashboard', label: 'Overview' },
    { to: '/analytics', label: 'Analytics' },
    { to: '/appointments', label: 'Scheduling' },
    { to: '/records', label: 'Records' },
    { to: '/emergency', label: 'Emergency' },
    { to: '/telehealth', label: 'Telehealth' },
  ],
};

function AppLayout() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('careconnect-theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const role = (user?.role || 'PATIENT').toUpperCase();
  const navItems = useMemo(() => navByRole[role] || navByRole.PATIENT, [role]);

  const signIn = (u) => { setCsrf(u.csrf); setUser(u); };
  const signOut = () => { setCsrf(''); setUser(null); };
  const logout = async () => { await api.post('/auth/logout').catch(() => {}); signOut(); };

  useEffect(() => {
    localStorage.setItem('careconnect-theme', darkMode ? 'dark' : 'light');
    document.documentElement.style.colorScheme = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  useEffect(() => { api.get('/auth/me').then(signIn).catch(() => {}).finally(() => setReady(true)); }, []);

  if (!ready) return <p className="empty app-loading">Loading CareConnect platform…</p>;

  const isHomePage = location.pathname === '/' || location.pathname === '';

  return (
    <div className={darkMode ? 'app-root dark-mode' : 'app-root'}>
      <header className="topbar">
        <div className="nav-shell">
          <Link className="brand" to="/">
            <span className="brand-mark">✚</span>
            <span>CareConnect</span>
          </Link>

          <nav className="main-nav" aria-label="Primary navigation">
            {navItems.map(({ to, label }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="nav-actions">
            <button type="button" className="theme-toggle" onClick={() => setDarkMode((value) => !value)}>
              {darkMode ? 'Light mode' : 'Dark mode'}
            </button>

            {user ? (
              <>
                <span className="user-pill">{user.name}</span>
                <span className="user-role">{user.role}</span>
                <a href="#/" className="nav-link" onClick={(e) => { e.preventDefault(); logout(); }}>Log out</a>
              </>
            ) : (
              <>
                <Link className="nav-link" to="/login">Log in</Link>
                <Link className="btn primary" to="/signup">Create account</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className={`app-shell ${isHomePage ? 'home-shell' : 'page-shell-container'}`}>
        <Routes>
          <Route path="/" element={user ? <Dashboard user={user} onExpired={signOut} /> : <Landing />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/records" element={<PatientRecordsPage />} />
          <Route path="/telehealth" element={<TelehealthPage />} />
          <Route path="/consultation" element={<TelemedicineConsultationPage />} />
          <Route path="/analytics" element={<AnalyticsReportsPage />} />
          <Route path="/emergency" element={<EmergencyPage />} />
          <Route path="/dashboard" element={<Dashboard user={user || { role: 'ADMIN', name: 'CareConnect Admin' }} onExpired={signOut} />} />
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={signIn} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      <EmergencyHelpBar />
      <AiHelpWidget />
      <footer className="site-footer">CareConnect · clinical operations, telehealth, and emergency response</footer>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppLayout />
    </HashRouter>
  );
}
