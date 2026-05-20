import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Search, Download, Bell, Sun, Moon, Settings, HelpCircle, LogOut } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TopBarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  activeTab?: 'overview' | 'reports';
  onExport?: () => void;
}

export default function TopBar({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search leads, pipelines, or reports...',
  activeTab = 'overview',
  onExport,
}: TopBarProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const resolvedActiveTab = location.pathname === '/reports' ? 'reports' : activeTab;

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'U';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-surface-container-lowest/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-outline-variant dark:border-slate-800 shadow-soft flex justify-between items-center h-16 px-6 lg:pl-[284px] transition-colors">
      {/* Search Area */}
      <div className="flex-1 max-w-xl flex items-center gap-2 px-4 py-1.5 bg-surface-container-low dark:bg-slate-800 rounded-full border border-outline-variant dark:border-slate-700 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
        <Search className="w-4 h-4 text-on-surface-variant dark:text-slate-400" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="bg-transparent border-none focus:ring-0 focus:outline-none text-body-md w-full placeholder:text-on-surface-variant/50 dark:placeholder:text-slate-500 dark:text-slate-200"
          placeholder={searchPlaceholder}
        />
      </div>

      {/* Trailing Actions */}
      <div className="flex items-center gap-4 ml-6">
        <nav className="hidden md:flex items-center gap-6 mr-6">
          <Link
            to="/leads"
            className={`text-label-md pb-1 transition-all ${
              resolvedActiveTab === 'overview'
                ? 'text-primary border-b-2 border-primary font-semibold'
                : 'text-on-surface-variant hover:text-on-surface dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Overview
          </Link>
          <Link
            to="/reports"
            className={`text-label-md pb-1 transition-all ${
              resolvedActiveTab === 'reports'
                ? 'text-primary border-b-2 border-primary font-semibold'
                : 'text-on-surface-variant hover:text-on-surface dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Reports
          </Link>
        </nav>

        {onExport && (
          <button
            onClick={onExport}
            className="hidden sm:flex px-4 py-1.5 bg-surface-container-lowest dark:bg-slate-800 border border-primary text-primary rounded-lg text-label-md font-medium hover:bg-surface-container-low dark:hover:bg-slate-700 transition-all items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        )}

        <button 
          onClick={toggleTheme}
          className="p-2 text-on-surface-variant dark:text-slate-400 hover:bg-surface-container-low dark:hover:bg-slate-800 rounded-full transition-all relative"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button className="p-2 text-on-surface-variant dark:text-slate-400 hover:bg-surface-container-low dark:hover:bg-slate-800 rounded-full transition-all relative">
          <Bell className="w-5 h-5" />
        </button>

        <div 
          className="relative"
          onMouseEnter={() => setIsDropdownOpen(true)}
          onMouseLeave={() => setIsDropdownOpen(false)}
        >
          <div className="w-8 h-8 rounded-full bg-primary-fixed-dim dark:bg-primary/20 cursor-pointer flex items-center justify-center text-label-sm font-bold text-on-primary-fixed dark:text-primary overflow-hidden">
            {userInitials}
          </div>
          
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-outline-variant dark:border-slate-700 overflow-hidden"
              >
                <div className="px-4 py-2 border-b border-outline-variant dark:border-slate-700 mb-1">
                  <p className="text-sm font-medium text-on-surface dark:text-white truncate">{user?.name}</p>
                  <p className="text-xs text-on-surface-variant dark:text-slate-400 truncate">{user?.email}</p>
                </div>
                <Link to="/settings" className="flex items-center gap-3 px-4 py-2 text-sm text-on-surface-variant dark:text-slate-300 hover:bg-surface-container-low dark:hover:bg-slate-700 transition-colors">
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <Link to="/help" className="flex items-center gap-3 px-4 py-2 text-sm text-on-surface-variant dark:text-slate-300 hover:bg-surface-container-low dark:hover:bg-slate-700 transition-colors">
                  <HelpCircle className="w-4 h-4" />
                  Help
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
