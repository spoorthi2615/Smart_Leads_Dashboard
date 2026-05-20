import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import type { Lead, PaginationData } from '../types';
import { Mail, Calendar, Circle } from 'lucide-react';
import { Link } from 'react-router-dom';

const STATUSES = ['New', 'Contacted', 'Qualified', 'Lost'] as const;

export default function Pipeline() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<{ success: boolean; data: Lead[]; meta: PaginationData }>('/leads?limit=100');
      setLeads(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch leads');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'Contacted': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'Qualified': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'Lost': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const updateLeadStatus = async (id: string, newStatus: string) => {
    try {
      // Optimistic update
      setLeads(leads.map(lead => lead.id === id ? { ...lead, status: newStatus as any } : lead));
      
      const leadToUpdate = leads.find(l => l.id === id);
      if (!leadToUpdate) return;
      
      await api.put(`/leads/${id}`, {
        name: leadToUpdate.name,
        email: leadToUpdate.email,
        status: newStatus,
        source: leadToUpdate.source
      });
    } catch (err) {
      console.error('Failed to update status', err);
      fetchLeads(); // Revert on failure
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-on-surface dark:text-white mb-2">Lead Pipeline</h1>
          <p className="text-on-surface-variant dark:text-slate-400">Track and manage your leads through the sales process.</p>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-error/10 text-error rounded-lg">
          {error}
        </div>
      )}

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
        {STATUSES.map(status => {
          const columnLeads = leads.filter(l => l.status === status);
          
          return (
            <div key={status} className="flex flex-col min-w-[320px] w-[320px] bg-surface-container-lowest dark:bg-slate-900 rounded-xl border border-outline-variant dark:border-slate-800 flex-shrink-0">
              <div className="p-4 border-b border-outline-variant dark:border-slate-800 flex justify-between items-center bg-surface-container-low dark:bg-slate-800/50 rounded-t-xl">
                <h3 className="font-semibold text-on-surface dark:text-white flex items-center gap-2">
                  <Circle className={`w-3 h-3 ${getStatusColor(status).split(' ')[0]}`} fill="currentColor" />
                  {status}
                </h3>
                <span className="text-xs font-medium bg-surface-container-highest dark:bg-slate-700 text-on-surface-variant dark:text-slate-300 px-2.5 py-1 rounded-full">
                  {columnLeads.length}
                </span>
              </div>
              
              <div className="p-4 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                <AnimatePresence>
                  {columnLeads.map(lead => (
                    <motion.div
                      key={lead.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-outline-variant dark:border-slate-700 shadow-soft hover:shadow-md transition-shadow group relative"
                    >
                      <Link to={`/leads/${lead.id}`} className="block">
                        <h4 className="font-semibold text-on-surface dark:text-white mb-1 group-hover:text-primary dark:group-hover:text-primary-fixed-dim transition-colors">
                          {lead.name}
                        </h4>
                        
                        <div className="flex items-center gap-2 text-sm text-on-surface-variant dark:text-slate-400 mb-3">
                          <Mail className="w-3.5 h-3.5" />
                          <span className="truncate">{lead.email}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs mt-4 pt-4 border-t border-outline-variant/50 dark:border-slate-700/50">
                          <span className="text-on-surface-variant/70 dark:text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(lead.createdAt).toLocaleDateString()}
                          </span>
                          <span className={`px-2 py-1 rounded border ${getStatusColor(lead.status)}`}>
                            {lead.source}
                          </span>
                        </div>
                      </Link>

                      {/* Quick Actions (Move to next stage) */}
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <select 
                          className="text-xs bg-surface-container-highest dark:bg-slate-700 border border-outline-variant dark:border-slate-600 rounded px-2 py-1 text-on-surface dark:text-white cursor-pointer outline-none focus:ring-1 focus:ring-primary"
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                        >
                          {STATUSES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {columnLeads.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-32 text-on-surface-variant/50 dark:text-slate-500 border-2 border-dashed border-outline-variant/30 dark:border-slate-700/50 rounded-xl">
                    <span className="text-sm">No leads</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
