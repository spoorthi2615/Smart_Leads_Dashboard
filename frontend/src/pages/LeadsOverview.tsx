import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import StatusBadge from '../components/StatusBadge';
import SourceBadge from '../components/SourceBadge';
import type { Lead, LeadSource, LeadStatus, PaginationData } from '../types';

const statusOptions: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Lost'];
const sourceOptions: LeadSource[] = ['Website', 'Instagram', 'Referral'];

interface LeadResponse {
  success: boolean;
  data: Lead[];
  meta: PaginationData;
}

export default function LeadsOverview() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>('');
  const [sourceFilter, setSourceFilter] = useState<LeadSource | ''>('');
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 25,
    totalDocs: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const debouncedSearch = useDebounce(searchQuery, 400);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('page', String(pagination.page));
      params.append('limit', String(pagination.limit));

      if (statusFilter) params.append('status', statusFilter);
      if (sourceFilter) params.append('source', sourceFilter);
      if (debouncedSearch.trim()) params.append('search', debouncedSearch.trim());

      const response = await api.get<LeadResponse>(`/leads?${params.toString()}`);
      setLeads(response.data.data);
      setPagination(response.data.meta);
    } catch {
      setError('Unable to load leads at this time.');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, pagination.limit, pagination.page, sourceFilter, statusFilter]);

  useEffect(() => {
    void fetchLeads();
  }, [fetchLeads]);

  const handlePageChange = (newPage: number) => {
    setPagination((c) => ({ ...c, page: Math.min(Math.max(newPage, 1), c.totalPages) }));
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === leads.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(leads.map((l) => l.id)));
    }
  };

  const toggleRow = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/leads/${id}`);
      void fetchLeads();
    } catch {
      /* ignore */
    }
  };

  const leadCountLabel = useMemo(() => {
    const start = (pagination.page - 1) * pagination.limit + 1;
    const end = Math.min(pagination.page * pagination.limit, pagination.totalDocs);
    return `Showing ${start}-${end} of ${pagination.totalDocs.toLocaleString()} leads`;
  }, [pagination]);

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const initialsColors = [
    'bg-secondary-container text-on-secondary-container',
    'bg-primary/20 text-primary',
    'bg-tertiary-fixed-dim/30 text-tertiary',
    'bg-surface-variant text-on-surface-variant',
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-headline-lg text-on-surface">Leads Dashboard</h2>
          <p className="text-body-md text-on-surface-variant mt-1">
            Manage and track your global sales pipeline in real-time.
          </p>
        </div>
      </div>

      {/* Control Bar */}
      <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 mb-6 shadow-soft">
        <div className="flex flex-col xl:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap items-center gap-4 w-full">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-label-md text-on-surface-variant">Status:</span>
              <div className="flex bg-surface-container-low p-1 rounded-lg border border-outline-variant/30">
                <button
                  onClick={() => setStatusFilter('')}
                  className={`px-2 py-1 rounded-md text-label-sm transition-all ${
                    statusFilter === '' ? 'bg-surface-container-lowest text-primary shadow-soft font-semibold' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  All
                </button>
                {statusOptions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
                    className={`px-2 py-1 rounded-md text-label-sm transition-all ${
                      statusFilter === s ? 'bg-surface-container-lowest text-primary shadow-soft font-semibold' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Source Filter */}
            <div className="flex items-center gap-2">
              <span className="text-label-md text-on-surface-variant">Source:</span>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value as LeadSource | '')}
                className="bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-1.5 text-label-md focus:ring-primary focus:border-primary"
              >
                <option value="">All Channels</option>
                {sourceOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-lg border border-outline-variant/30 w-full max-w-xs">
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search leads..."
                  className="bg-transparent border-none focus:outline-none focus:ring-0 text-body-md w-full placeholder:text-on-surface-variant/50"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full xl:w-auto justify-end">
            <span className="text-label-md text-on-surface-variant italic whitespace-nowrap">{leadCountLabel}</span>
          </div>
        </div>
      </section>

      {/* Main Table */}
      {isLoading ? (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-16 flex items-center justify-center text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
          Loading leads...
        </div>
      ) : error ? (
        <div className="bg-error-container text-on-error-container rounded-xl p-8 text-center">
          {error}
          <button onClick={() => void fetchLeads()} className="ml-4 underline">Retry</button>
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-16 text-center">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-4 block">person_search</span>
          <h3 className="text-headline-sm text-on-surface mb-2">No leads found</h3>
          <p className="text-body-md text-on-surface-variant">Try adjusting your filters or adding new leads.</p>
        </div>
      ) : (
        <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50 border-b border-outline-variant">
                  <th className="p-4 w-12">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === leads.length && leads.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-outline-variant text-primary focus:ring-primary"
                    />
                  </th>
                  <th className="px-4 py-2 text-label-sm text-on-surface-variant uppercase tracking-wider">Name</th>
                  <th className="px-4 py-2 text-label-sm text-on-surface-variant uppercase tracking-wider">Email</th>
                  <th className="px-4 py-2 text-label-sm text-on-surface-variant uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2 text-label-sm text-on-surface-variant uppercase tracking-wider">Source</th>
                  <th className="px-4 py-2 text-label-sm text-on-surface-variant uppercase tracking-wider">Created Date</th>
                  <th className="px-4 py-2 text-label-sm text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {leads.map((lead, index) => (
                  <tr
                    key={lead.id}
                    className={`hover:bg-surface-container-low transition-colors group cursor-pointer ${
                      selectedRows.has(lead.id) ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => navigate(`/leads/${lead.id}`)}
                  >
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedRows.has(lead.id)}
                        onChange={() => toggleRow(lead.id)}
                        className="rounded border-outline-variant text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-label-sm ${initialsColors[index % initialsColors.length]}`}>
                          {getInitials(lead.name)}
                        </div>
                        <span className="text-label-md text-on-surface font-semibold">{lead.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-body-md text-on-surface-variant">{lead.email}</td>
                    <td className="px-4 py-2">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-4 py-2">
                      <SourceBadge source={lead.source} />
                    </td>
                    <td className="px-4 py-2 text-body-md text-on-surface-variant">
                      {new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => navigate(`/leads/${lead.id}`)}
                          className="p-1 text-on-surface-variant hover:text-primary transition-all"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(lead.id)}
                          className="p-1 text-on-surface-variant hover:text-error transition-all"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer / Pagination */}
          <div className="p-4 border-t border-outline-variant flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="text-label-md text-on-surface-variant hover:text-primary flex items-center gap-1 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span> Previous
              </button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`w-8 h-8 rounded text-label-sm ${
                      p === pagination.page
                        ? 'bg-primary text-on-primary font-bold'
                        : 'text-on-surface-variant hover:bg-surface-container-low'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="text-label-md text-on-surface-variant hover:text-primary flex items-center gap-1 disabled:opacity-50"
              >
                Next <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-label-md text-on-surface-variant">Rows per page:</span>
              <select
                value={pagination.limit}
                onChange={(e) => setPagination((c) => ({ ...c, limit: Number(e.target.value), page: 1 }))}
                className="bg-transparent border-none focus:ring-0 text-label-md text-on-surface-variant cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </section>
      )}

      {/* Mobile FAB */}
      <button className="fixed bottom-6 right-6 lg:hidden bg-primary text-on-primary w-14 h-14 rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-all z-50">
        <span className="material-symbols-outlined text-[28px]">add</span>
      </button>
    </div>
  );
}
