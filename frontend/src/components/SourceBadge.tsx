import type { LeadSource } from '../types';

const sourceStyles: Record<LeadSource, string> = {
  Website: 'bg-slate-100 text-slate-700 border border-slate-200',
  Instagram: 'bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200',
  Referral: 'bg-violet-100 text-violet-700 border border-violet-200',
};

interface SourceBadgeProps {
  source: LeadSource;
}

export default function SourceBadge({ source }: SourceBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-semibold ${sourceStyles[source]}`}
    >
      {source}
    </span>
  );
}
