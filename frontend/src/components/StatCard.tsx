interface StatCardProps {
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
}

export default function StatCard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  trend,
  trendType = 'neutral',
}: StatCardProps) {
  const trendColors = {
    positive: 'bg-green-50 text-green-700',
    negative: 'bg-red-50 text-red-700',
    neutral: 'bg-blue-50 text-blue-700',
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-soft hover:border-primary transition-all group cursor-default">
      <div className="flex justify-between items-start mb-2">
        <div className={`p-1 ${iconBg} rounded-lg ${iconColor}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        {trend && (
          <span className={`text-label-sm font-semibold px-1 py-0.5 rounded ${trendColors[trendType]}`}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-label-md text-on-surface-variant">{label}</p>
      <h3 className="text-headline-md mt-1 text-on-surface">{value}</h3>
    </div>
  );
}
