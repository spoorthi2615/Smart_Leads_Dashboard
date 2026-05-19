import type { LeadStatus } from '../types';

const statusStyles: Record<LeadStatus, string> = {
  New: 'bg-blue-100 text-blue-700',
  Contacted: 'bg-amber-100 text-amber-700',
  Qualified: 'bg-emerald-100 text-emerald-700',
  Lost: 'bg-rose-100 text-rose-700',
};

interface StatusBadgeProps {
  status: LeadStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-semibold ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}
