import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
  const { user } = useAuth();
  const location = useLocation();
  const resolvedActiveTab = location.pathname === '/reports' ? 'reports' : activeTab;

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-40 w-full bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant shadow-soft flex justify-between items-center h-16 px-6 lg:pl-[284px]">
      {/* Search Area */}
      <div className="flex-1 max-w-xl flex items-center gap-2 px-4 py-1 bg-surface-container-low rounded-full border border-outline-variant focus-within:ring-2 focus-within:ring-primary/20 transition-all">
        <span className="material-symbols-outlined text-on-surface-variant">search</span>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="bg-transparent border-none focus:ring-0 focus:outline-none text-body-md w-full placeholder:text-on-surface-variant/50"
          placeholder={searchPlaceholder}
        />
      </div>

      {/* Trailing Actions */}
      <div className="flex items-center gap-4 ml-6">
        <nav className="hidden md:flex items-center gap-6 mr-6">
          <Link
            to="/dashboard"
            className={`text-label-md pb-1 transition-all ${
              resolvedActiveTab === 'overview'
                ? 'text-primary border-b-2 border-primary font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Overview
          </Link>
          <Link
            to="/reports"
            className={`text-label-md pb-1 transition-all ${
              resolvedActiveTab === 'reports'
                ? 'text-primary border-b-2 border-primary font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Reports
          </Link>
        </nav>

        {onExport && (
          <button
            onClick={onExport}
            className="hidden sm:flex px-4 py-1.5 bg-surface-container-lowest border border-primary text-primary rounded-lg text-label-md font-medium hover:bg-surface-container-low transition-all items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            Export CSV
          </button>
        )}

        <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-all relative">
          <span className="material-symbols-outlined">notifications</span>
        </button>

        <div className="w-8 h-8 rounded-full bg-primary-fixed-dim flex items-center justify-center text-label-sm font-bold text-on-primary-fixed overflow-hidden">
          {userInitials}
        </div>
      </div>
    </header>
  );
}
