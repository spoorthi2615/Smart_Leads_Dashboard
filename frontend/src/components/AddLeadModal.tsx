import { useState } from 'react';
import api from '../services/api';
import type { LeadSource, LeadStatus } from '../types';
import { useValidationError } from '../hooks/useValidationError';

interface AddLeadModalProps {
  onClose: () => void;
  onLeadAdded?: () => void;
}

export default function AddLeadModal({ onClose, onLeadAdded }: AddLeadModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<LeadStatus>('New');
  const [source, setSource] = useState<LeadSource>('Website');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { fieldErrors, parseError, clearErrors } = useValidationError();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    clearErrors();

    try {
      await api.post('/leads', { name, email, status, source });
      onLeadAdded?.();
      onClose();
    } catch (err: unknown) {
      const parsed = parseError(err);
      if (parsed._global) {
        setError(parsed._global);
      } else if (Object.keys(parsed).length > 0) {
        setError('Please fix the validation errors below.');
      } else {
        setError('Failed to create lead. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg p-6 z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-headline-sm font-semibold text-on-surface">Add New Lead</h2>
          <button
            onClick={onClose}
            className="p-1 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-all"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error-container text-on-error-container text-body-md rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-label-md text-on-surface-variant mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-4 py-2.5 bg-surface-container-lowest border ${fieldErrors.name ? 'border-error ring-1 ring-error/20' : 'border-outline-variant'} rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
              placeholder="e.g. Sarah Jenkins"
            />
            {fieldErrors.name && <p className="mt-1 text-label-sm text-error">{fieldErrors.name}</p>}
          </div>

          <div>
            <label className="block text-label-md text-on-surface-variant mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-2.5 bg-surface-container-lowest border ${fieldErrors.email ? 'border-error ring-1 ring-error/20' : 'border-outline-variant'} rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
              placeholder="e.g. sarah@company.com"
            />
            {fieldErrors.email && <p className="mt-1 text-label-sm text-error">{fieldErrors.email}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label-md text-on-surface-variant mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus)}
                className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
            <div>
              <label className="block text-label-md text-on-surface-variant mb-1">Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as LeadSource)}
                className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="Website">Website</option>
                <option value="Instagram">Instagram</option>
                <option value="Referral">Referral</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-outline-variant text-on-surface-variant rounded-lg text-label-md font-medium hover:bg-surface-container-low transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-primary text-on-primary rounded-lg text-label-md font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
