import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import AddLeadModal from './AddLeadModal';
import { Users, GitMerge, BarChart2, Plus } from 'lucide-react';

const mainNav = [
  { label: 'Leads', icon: Users, path: '/leads' },
  { label: 'Pipelines', icon: GitMerge, path: '/pipelines' },
  { label: 'Analytics', icon: BarChart2, path: '/analytics' },
];

export default function Sidebar() {
  const [showAddLead, setShowAddLead] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? 'flex items-center gap-4 px-4 py-2 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-fixed-dim border-l-[3px] border-primary font-bold cursor-pointer transition-all text-body-md'
      : 'flex items-center gap-4 px-4 py-2 text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-white hover:bg-surface-container-high dark:hover:bg-slate-800 transition-colors duration-200 cursor-pointer text-body-md';

  return (
    <>
      <aside className="fixed h-screen w-[260px] left-0 top-0 hidden lg:flex flex-col bg-surface-container-lowest dark:bg-slate-900 border-r border-outline-variant dark:border-slate-800 z-50 transition-colors">
        <div className="flex flex-col h-full py-6">
          {/* Brand Header */}
          <div className="px-6 mb-8">
            <h1 className="text-headline-sm text-primary dark:text-primary-fixed-dim font-semibold">Smart Leads</h1>
            <p className="text-label-md text-on-surface-variant dark:text-slate-400 opacity-70">Enterprise SaaS</p>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            {mainNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.path} to={item.path} className={linkClass}>
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Add Lead CTA */}
          <div className="px-6 mb-6">
            <button
              onClick={() => setShowAddLead(true)}
              className="w-full bg-primary text-on-primary py-2.5 rounded-lg text-label-md font-medium shadow-soft hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Lead
            </button>
          </div>
        </div>
      </aside>

      {showAddLead && <AddLeadModal onClose={() => setShowAddLead(false)} />}
    </>
  );
}
