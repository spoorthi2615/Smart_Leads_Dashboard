import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AddLeadModal from './AddLeadModal';

const mainNav = [
  { label: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
  { label: 'Leads', icon: 'group', path: '/leads' },
  { label: 'Pipelines', icon: 'account_tree', path: '/pipelines' },
  { label: 'Analytics', icon: 'leaderboard', path: '/analytics' },
];

const footerNav = [
  { label: 'Settings', icon: 'settings', path: '/settings' },
  { label: 'Help', icon: 'help', path: '/help' },
];

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showAddLead, setShowAddLead] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? 'flex items-center gap-4 px-4 py-2 bg-primary/10 text-primary border-l-[3px] border-primary font-bold cursor-pointer transition-all text-body-md'
      : 'flex items-center gap-4 px-4 py-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors duration-200 cursor-pointer text-body-md';

  return (
    <>
      <aside className="fixed h-screen w-[260px] left-0 top-0 hidden lg:flex flex-col bg-surface-container-lowest border-r border-outline-variant z-50">
        <div className="flex flex-col h-full py-6">
          {/* Brand Header */}
          <div className="px-6 mb-8">
            <h1 className="text-headline-sm text-primary font-semibold">Smart Leads</h1>
            <p className="text-label-md text-on-surface-variant opacity-70">Enterprise SaaS</p>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            {mainNav.map((item) => (
              <NavLink key={item.path} to={item.path} className={linkClass}>
                <span className="material-symbols-outlined">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Add Lead CTA */}
          <div className="px-6 mb-6">
            <button
              onClick={() => setShowAddLead(true)}
              className="w-full bg-primary text-on-primary py-2 rounded-lg text-label-md font-medium shadow-soft hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Lead
            </button>
          </div>

          {/* Footer Navigation */}
          <div className="px-4 mt-auto pt-4 border-t border-outline-variant/30">
            {footerNav.map((item) => (
              <NavLink key={item.path} to={item.path} className={linkClass}>
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="text-label-md">{item.label}</span>
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-2 text-on-surface-variant hover:text-error transition-colors duration-200 cursor-pointer mt-2 text-body-md"
            >
              <span className="material-symbols-outlined">logout</span>
              <span className="text-label-md">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {showAddLead && <AddLeadModal onClose={() => setShowAddLead(false)} />}
    </>
  );
}
