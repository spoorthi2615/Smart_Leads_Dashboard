import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import type { Lead, LeadActivity, LeadNote, LeadStatus } from '../types';
import { useValidationError } from '../hooks/useValidationError';

// Mock activity data (activity log is a future backend feature)
const mockActivities: LeadActivity[] = [
  {
    id: '1',
    type: 'status_change',
    title: 'Lead Created',
    description: 'Lead was added to the system.',
    timestamp: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'email_sent',
    title: 'Outgoing Email Sent',
    description: 'Subject: "Follow up on Enterprise Q4 Strategy". Opened 3 times.',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
];

const mockNotes: LeadNote[] = [
  {
    id: '1',
    content: '"Prefers afternoon calls. Interested in the API integration features."',
    author: 'Admin User',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

const statusOptions: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Lost'];

export default function LeadDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit modal state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editStatus, setEditStatus] = useState<LeadStatus>('New');
  const [editSource, setEditSource] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const { fieldErrors, parseError, clearErrors } = useValidationError();

  // Delete confirm state
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const scoreRef = useRef<HTMLSpanElement>(null);

  const fetchLead = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get<{ success: boolean; data: Lead }>(`/leads/${id}`);
      setLead(res.data.data);
    } catch {
      setError('Failed to load lead details.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchLead();
  }, [fetchLead]);

  // Animate health score (derived from lead data)
  useEffect(() => {
    if (!lead || !scoreRef.current) return;
    const target = lead.status === 'Qualified' ? 92 : lead.status === 'Contacted' ? 74 : lead.status === 'New' ? 55 : 30;
    let current = 0;
    const step = target / (1500 / 16);
    const animate = () => {
      current += step;
      if (current < target) {
        if (scoreRef.current) scoreRef.current.textContent = String(Math.floor(current));
        requestAnimationFrame(animate);
      } else {
        if (scoreRef.current) scoreRef.current.textContent = String(target);
      }
    };
    animate();
  }, [lead]);

  const openEdit = () => {
    if (!lead) return;
    setEditName(lead.name);
    setEditEmail(lead.email);
    setEditStatus(lead.status);
    setEditSource(lead.source);
    setEditError(null);
    clearErrors();
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;
    setIsSaving(true);
    setEditError(null);
    clearErrors();
    try {
      await api.put(`/leads/${lead.id}`, {
        name: editName,
        email: editEmail,
        status: editStatus,
        source: editSource,
      });
      setIsEditing(false);
      void fetchLead();
    } catch (err: unknown) {
      const parsed = parseError(err);
      if (parsed._global) {
        setEditError(parsed._global);
      } else if (Object.keys(parsed).length > 0) {
        setEditError('Please fix the validation errors below.');
      } else {
        setEditError('Failed to update lead. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!lead) return;
    setIsDeleting(true);
    try {
      await api.delete(`/leads/${lead.id}`);
      navigate('/leads');
    } catch {
      setShowDeleteConfirm(false);
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
        Loading lead details...
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="bg-error-container text-on-error-container rounded-xl p-8 text-center">
        {error || 'Lead not found.'}
        <button onClick={() => navigate('/leads')} className="ml-4 underline">Back to Leads</button>
      </div>
    );
  }

  const healthScore = lead.status === 'Qualified' ? 92 : lead.status === 'Contacted' ? 74 : lead.status === 'New' ? 55 : 30;
  const scoreLabel = healthScore >= 80 ? 'EXCELLENT' : healthScore >= 60 ? 'GOOD' : 'FAIR';

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    // eslint-disable-next-line react-hooks/purity
    const diff = Date.now() - d.getTime();
    if (diff < 86400000) return `Today, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    if (diff < 172800000) return `Yesterday, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  const relativeTime = (ts: string) => {
    // eslint-disable-next-line react-hooks/purity
    const days = Math.floor((Date.now() - new Date(ts).getTime()) / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  return (
    <div>
      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm" onClick={() => setIsEditing(false)} />
          <div className="relative w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg p-6 z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-headline-sm font-semibold">Edit Lead</h2>
              <button onClick={() => setIsEditing(false)} className="p-1 hover:bg-surface-container rounded-lg">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {editError && (
              <div className="mb-4 p-3 bg-error-container text-on-error-container text-body-md rounded-lg">{editError}</div>
            )}
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1">Full Name</label>
                <input
                  type="text" required value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={`w-full px-4 py-2.5 bg-surface-container-lowest border ${fieldErrors.name ? 'border-error ring-1 ring-error/20' : 'border-outline-variant'} rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
                />
                {fieldErrors.name && <p className="mt-1 text-label-sm text-error">{fieldErrors.name}</p>}
              </div>
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1">Email Address</label>
                <input
                  type="email" required value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className={`w-full px-4 py-2.5 bg-surface-container-lowest border ${fieldErrors.email ? 'border-error ring-1 ring-error/20' : 'border-outline-variant'} rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
                />
                {fieldErrors.email && <p className="mt-1 text-label-sm text-error">{fieldErrors.email}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-1">Status</label>
                  <select
                    value={editStatus} onChange={(e) => setEditStatus(e.target.value as LeadStatus)}
                    className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-1">Source</label>
                  <select
                    value={editSource} onChange={(e) => setEditSource(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="Website">Website</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Referral">Referral</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-2.5 border border-outline-variant text-on-surface-variant rounded-lg text-label-md font-medium hover:bg-surface-container-low transition-all"
                >
                  Cancel
                </button>
                <button type="submit" disabled={isSaving}
                  className="flex-1 px-4 py-2.5 bg-primary text-on-primary rounded-lg text-label-md font-medium hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative w-full max-w-sm bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg p-6 z-10 text-center">
            <span className="material-symbols-outlined text-[48px] text-error mb-4 block">delete_forever</span>
            <h2 className="text-headline-sm font-semibold mb-2">Delete Lead?</h2>
            <p className="text-body-md text-on-surface-variant mb-6">
              This will permanently delete <strong>{lead.name}</strong>. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 border border-outline-variant text-on-surface-variant rounded-lg text-label-md font-medium hover:bg-surface-container-low"
              >
                Cancel
              </button>
              <button onClick={handleDelete} disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-error text-on-error rounded-lg text-label-md font-medium hover:bg-error/90 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => navigate('/leads')}
        className="flex items-center gap-1 text-on-surface-variant hover:text-primary text-label-md mb-4 transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back to Leads
      </button>

      {/* Lead Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-xl bg-surface-container-high border border-outline-variant flex items-center justify-center overflow-hidden">
            <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary text-headline-md font-bold">
              {lead.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-headline-lg">{lead.name}</h2>
              <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={lead.status} />
              <div className="flex items-center gap-1 px-2 py-0.5 bg-surface-container-high text-on-surface-variant rounded-full text-label-sm font-semibold">
                <span className="material-symbols-outlined text-[14px]">public</span>
                {lead.source}
              </div>
              <span className="text-on-surface-variant text-label-sm">
                • Created {new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openEdit}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl text-label-md font-medium hover:bg-primary/90 transition-all shadow-soft"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Edit Lead
          </button>
          {isAdmin && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 border border-error/50 text-error bg-transparent rounded-xl text-label-md hover:bg-error/10 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-5">
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-8 space-y-5">
          {/* Lead Info Card */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-headline-sm mb-6">Lead Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">mail</span>
                  </div>
                  <div>
                    <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Email Address</p>
                    <p className="text-body-md font-semibold">{lead.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  <div>
                    <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Added By</p>
                    <p className="text-body-md font-semibold">{lead.createdBy.name}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">public</span>
                  </div>
                  <div>
                    <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Source Channel</p>
                    <p className="text-body-md font-semibold">{lead.source}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">schedule</span>
                  </div>
                  <div>
                    <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Last Updated</p>
                    <p className="text-body-md font-semibold">
                      {new Date(lead.updatedAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-headline-sm">Activity Timeline</h3>
            </div>
            <div className="space-y-6 relative timeline-line">
              {mockActivities.map((activity, i) => (
                <div key={activity.id} className="relative flex gap-4">
                  <div className={`z-10 w-4 h-4 rounded-full mt-1 ${i === 0 ? 'bg-primary ring-4 ring-primary/10' : 'bg-outline-variant'}`} />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-body-md font-bold text-on-surface">{activity.title}</p>
                      <span className="text-label-md text-on-surface-variant">{formatTime(activity.timestamp)}</span>
                    </div>
                    <p className="text-body-md text-on-surface-variant">{activity.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-4 space-y-5">
          {/* Health Score */}
          <div className="glass-card rounded-xl p-6 bg-primary-container text-on-primary-container relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="text-label-md uppercase tracking-wider opacity-80 mb-2">Lead Health Score</h4>
              <div className="flex items-end gap-2">
                <span ref={scoreRef} className="text-[48px] font-semibold leading-none">0</span>
                <span className="text-label-md mb-2 font-bold bg-on-primary-container/20 px-2 py-1 rounded">{scoreLabel}</span>
              </div>
              <p className="text-body-md mt-4 opacity-90">
                Based on current pipeline status: <strong>{lead.status}</strong>.
              </p>
            </div>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-on-primary-container opacity-10 rounded-full blur-3xl" />
          </div>

          {/* Private Notes */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-headline-sm">Private Notes</h3>
              <button className="p-1 hover:bg-surface-container-low rounded">
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
              </button>
            </div>
            <div className="space-y-4">
              {mockNotes.map((note) => (
                <div key={note.id} className="p-4 bg-surface-container-lowest border border-outline-variant rounded-lg">
                  <p className="text-body-md italic text-on-surface-variant mb-2">{note.content}</p>
                  <div className="flex justify-between text-label-sm">
                    <span className="font-bold">{note.author}</span>
                    <span>{relativeTime(note.createdAt)}</span>
                  </div>
                </div>
              ))}
              <button className="w-full py-2 border-2 border-dashed border-outline-variant text-on-surface-variant text-label-md rounded-lg hover:border-primary hover:text-primary transition-all">
                + Add new note
              </button>
            </div>
          </div>

          {/* Pipeline Actions */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-headline-sm mb-6">Quick Actions</h3>
            <div className="space-y-2">
              {statusOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => { setEditStatus(s); openEdit(); }}
                  disabled={lead.status === s}
                  className={`w-full flex items-center justify-between px-4 py-2 rounded-xl group transition-all text-label-md ${lead.status === s ? 'bg-primary/10 text-primary font-semibold' : 'bg-surface-container-low hover:bg-surface-container-high'}`}
                >
                  <span>Move to {s}</span>
                  {lead.status === s
                    ? <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    : <span className="material-symbols-outlined text-on-surface-variant text-[18px]">chevron_right</span>
                  }
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
