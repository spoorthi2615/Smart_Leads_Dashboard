import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import type { Lead, LeadActivity, LeadNote } from '../types';

// Mock data for fields not yet in the API
const mockDetails: Record<string, { phone: string; company: string; location: string; healthScore: number }> = {};
function getMockDetails(id: string) {
  if (!mockDetails[id]) {
    mockDetails[id] = {
      phone: '+1 (555) 924-1102',
      company: 'Enterprise Solutions Group',
      location: 'San Francisco, CA',
      healthScore: Math.floor(Math.random() * 30) + 70,
    };
  }
  return mockDetails[id];
}

const mockActivities: LeadActivity[] = [
  {
    id: '1',
    type: 'status_change',
    title: 'Updated Lead Status',
    description: 'Lead moved from Prospect to Qualified by Michael Ross.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '2',
    type: 'email_sent',
    title: 'Outgoing Email Sent',
    description: 'Subject: "Follow up on Enterprise Q4 Strategy". Opened 3 times.',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    type: 'lead_imported',
    title: 'Lead Imported',
    description: 'Source: Instagram Ad Campaign #12 (Enterprise Mobility).',
    timestamp: '2023-10-12T10:00:00Z',
  },
];

const mockNotes: LeadNote[] = [
  {
    id: '1',
    content: '"Prefers afternoon calls. Heavily interested in the API integration features for their CRM."',
    author: 'Admin User',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

export default function LeadDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fetchLead = async () => {
      setIsLoading(true);
      try {
        const res = await api.get<{ success: boolean; data: Lead }>(`/leads/${id}`);
        setLead(res.data.data);
      } catch {
        setError('Failed to load lead details.');
      } finally {
        setIsLoading(false);
      }
    };
    void fetchLead();
  }, [id]);

  // Animate health score
  useEffect(() => {
    if (!lead || !scoreRef.current) return;
    const details = getMockDetails(lead.id);
    const target = details.healthScore;
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

  const details = getMockDetails(lead.id);
  const scoreLabel = details.healthScore >= 80 ? 'EXCELLENT' : details.healthScore >= 60 ? 'GOOD' : 'FAIR';

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) {
      return `Today, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    }
    if (diff < 172800000) {
      return `Yesterday, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  const relativeTime = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  return (
    <div>
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
              {lead.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-headline-lg">{lead.name}</h2>
              <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={lead.status} />
              <div className="flex items-center gap-1 px-2 py-0.5 bg-surface-container-high text-on-surface-variant rounded-full text-label-sm font-semibold">
                <span className="material-symbols-outlined text-[14px]">public</span>
                {lead.source}
              </div>
              <span className="text-on-surface-variant text-label-sm">• Last active 2 hours ago</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl text-label-md font-medium hover:bg-primary/90 transition-all shadow-soft">
            <span className="material-symbols-outlined text-[18px]">near_me</span>
            Message
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant bg-surface-container-lowest text-on-surface rounded-xl text-label-md hover:bg-surface-container-low transition-all">
            <span className="material-symbols-outlined text-[18px]">more_horiz</span>
          </button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-5">
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-8 space-y-5">
          {/* Personal Info Card */}
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
                    <span className="material-symbols-outlined">call</span>
                  </div>
                  <div>
                    <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Phone Number</p>
                    <p className="text-body-md font-semibold">{details.phone}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">location_on</span>
                  </div>
                  <div>
                    <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Location</p>
                    <p className="text-body-md font-semibold">{details.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">business</span>
                  </div>
                  <div>
                    <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Company</p>
                    <p className="text-body-md font-semibold">{details.company}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-headline-sm">Activity Timeline</h3>
              <button className="text-primary text-label-md flex items-center gap-1 hover:underline">
                Filter History
                <span className="material-symbols-outlined text-[16px]">filter_list</span>
              </button>
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
                    {activity.type === 'email_sent' && (
                      <button className="mt-2 px-2 py-1 border border-outline-variant rounded bg-surface-container-lowest text-label-sm hover:bg-surface-container-low">
                        View Email
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-4 space-y-5">
          {/* Health Score Widget */}
          <div className="glass-card rounded-xl p-6 bg-primary-container text-on-primary-container relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="text-label-md uppercase tracking-wider opacity-80 mb-2">Lead Health Score</h4>
              <div className="flex items-end gap-2">
                <span ref={scoreRef} className="text-[48px] font-semibold leading-none">0</span>
                <span className="text-label-md mb-2 font-bold bg-on-primary-container/20 px-2 py-1 rounded">{scoreLabel}</span>
              </div>
              <p className="text-body-md mt-4 opacity-90">
                High engagement across social channels and email opens suggests readiness for closing.
              </p>
            </div>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-on-primary-container opacity-10 rounded-full blur-3xl" />
            <div className="absolute right-0 top-0 w-24 h-24 bg-on-primary-container opacity-5 rotate-45 transform translate-x-1/2 -translate-y-1/2" />
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
            <h3 className="text-headline-sm mb-6">Pipeline Actions</h3>
            <div className="space-y-2">
              {[
                { icon: 'mail', label: 'Send Email Template' },
                { icon: 'low_priority', label: 'Move to Pipeline' },
                { icon: 'person_add', label: 'Assign Owner' },
              ].map((action) => (
                <button
                  key={action.label}
                  className="w-full flex items-center justify-between px-4 py-2 bg-surface-container-low hover:bg-surface-container-high rounded-xl group transition-all"
                >
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">{action.icon}</span>
                    <span className="text-label-md">{action.label}</span>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">chevron_right</span>
                </button>
              ))}
              <button className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-2 text-error hover:bg-error-container/20 rounded-xl transition-all text-label-md">
                <span className="material-symbols-outlined text-[20px]">delete_outline</span>
                Archive Lead
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
