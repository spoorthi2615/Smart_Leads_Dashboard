import { motion } from 'framer-motion';
import { LogOut, Moon, Sun, UserCircle } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { applyTheme, getInitialTheme, type ThemeMode } from '../utils/themeConfig';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { label: 'Dashboard', path: '/dashboard' },
];

function activeClass(isActive: boolean): string {
  return isActive ? 'nav-item active' : 'nav-item';
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme());
  const navigate = useNavigate();

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const greeting = useMemo(() => {
    if (!user) {
      return 'Welcome';
    }

    return `Welcome back, ${user.name}`;
  }, [user]);

  const toggleTheme = (): void => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  };

  const handleLogout = (): void => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <Link to="/dashboard">SmartLead</Link>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} className={({ isActive }) => activeClass(isActive)}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button type="button" className="button-secondary" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />} {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          <button type="button" className="button-secondary" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="page-heading">
          <div>
            <h1>{greeting}</h1>
            <p className="subtitle">Role: {user?.role ?? 'Guest'}</p>
          </div>
          <div className="header-actions">
            <button type="button" className="filter-button button-secondary" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />} {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
            <button type="button" className="button button-primary" onClick={handleLogout}>
              <UserCircle size={16} /> Sign out
            </button>
          </div>
        </header>

        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          {children}
        </motion.section>
      </main>
    </div>
  );
}
