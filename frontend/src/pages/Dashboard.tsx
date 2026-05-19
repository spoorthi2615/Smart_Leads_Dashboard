import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { exportLeadsToCsv } from '../utils/csvExport';
import { useDebounce } from '../hooks/useDebounce';
import type { Lead, LeadSource, LeadStatus, PaginationData } from '../types';

const statusOptions: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Lost'];
const sourceOptions: LeadSource[] = ['Website', 'Instagram', 'Referral'];

interface LeadResponse {
  success: boolean;
  data: Lead[];
  meta: PaginationData;
}

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>('');
  const [sourceFilter, setSourceFilter] = useState<LeadSource | ''>('');
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    totalDocs: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 400);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('page', String(pagination.page));
      params.append('limit', String(pagination.limit));

      if (statusFilter) {
        params.append('status', statusFilter);
      }

      if (sourceFilter) {
        params.append('source', sourceFilter);
      }

      if (debouncedSearch.trim()) {
        params.append('search', debouncedSearch.trim());
      }

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

  const handlePageChange = (newPage: number): void => {
    setPagination((current) => ({ ...current, page: Math.min(Math.max(newPage, 1), current.totalPages) }));
  };

  const handleResetFilters = (): void => {
    setStatusFilter('');
    setSourceFilter('');
    setSearchQuery('');
    setPagination((current) => ({ ...current, page: 1 }));
  };

  const leadCountLabel = useMemo(() => {
    return `${pagination.totalDocs} lead${pagination.totalDocs === 1 ? '' : 's'}`;
  }, [pagination.totalDocs]);

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Lead management</h1>
          <p>Review leads, filter status and source, and export current results.</p>
        </div>
        <div className="button-group">
          <button type="button" className="button button-primary" onClick={() => exportLeadsToCsv(leads)}>
            Export CSV
          </button>
        </div>
      </div>

      <section className="filter-panel">
        <input
          type="search"
          className="input-field"
          value={searchQuery}
          placeholder="Search by name or email"
          onChange={(event) => setSearchQuery(event.target.value)}
        />
        <select className="select-field" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as LeadStatus | '')}>
          <option value="">All statuses</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select className="select-field" value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value as LeadSource | '')}>
          <option value="">All sources</option>
          {sourceOptions.map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </select>
        <button type="button" className="filter-button button-secondary" onClick={handleResetFilters}>
          Reset filters
        </button>
      </section>

      {isLoading ? (
        <div className="loading-screen">Loading leads...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : leads.length === 0 ? (
        <div className="empty-state">
          <h2>No leads found</h2>
          <p>Try adjusting your filters or adding new leads.</p>
        </div>
      ) : (
        <>
          <div className="card-grid">
            <div className="table-shell">
              <div className="page-heading">
                <h2>{leadCountLabel}</h2>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Source</th>
                      <th>Created by</th>
                      <th>Created at</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <motion.tr key={lead.id} whileHover={{ y: -1 }} transition={{ duration: 0.2 }}>
                        <td>{lead.name}</td>
                        <td>{lead.email}</td>
                        <td>
                          <span className="badge">{lead.status}</span>
                        </td>
                        <td>{lead.source}</td>
                        <td>{lead.createdBy.name}</td>
                        <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="pagination">
            <button type="button" className="button-secondary" onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1}>
              Previous
            </button>
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button type="button" className="button-secondary" onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.totalPages}>
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
