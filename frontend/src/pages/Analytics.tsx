import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import StatCard from '../components/StatCard';

interface PipelineItem {
  label: string;
  count: number;
}

interface SourceItem {
  label: string;
  count: number;
  pct: number;
}

interface DailyVolume {
  _id: string;
  count: number;
}

interface AnalyticsData {
  totalLeads: number;
  leadsToday: number;
  growthPct: number;
  leadsLast30Days: number;
  pipeline: PipelineItem[];
  sources: SourceItem[];
  dailyVolume: DailyVolume[];
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<{ success: boolean; data: AnalyticsData }>('/analytics');
      setData(res.data.data);
    } catch {
      setError('Failed to load analytics data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAnalytics();
  }, [fetchAnalytics]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
        Loading analytics...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-error-container text-on-error-container rounded-xl p-8 text-center">
        {error || 'Unable to load analytics.'}
        <button onClick={() => void fetchAnalytics()} className="ml-4 underline">Retry</button>
      </div>
    );
  }

  // Prepare chart bars from daily volume
  const maxDailyCount = Math.max(...data.dailyVolume.map((d) => d.count), 1);
  const chartBars = data.dailyVolume.length > 0
    ? data.dailyVolume
    : Array.from({ length: 12 }, (_, i) => ({ _id: `day-${i}`, count: 0 }));

  // Pipeline max for percentage bars
  const pipelineMax = Math.max(...data.pipeline.map((p) => p.count), 1);

  // Source colors
  const sourceColors: Record<string, string> = {
    Website: 'bg-primary',
    Instagram: 'bg-secondary-container',
    Referral: 'bg-surface-variant',
  };

  // Source stroke colors for SVG donut
  const sourceStrokeColors: Record<string, string> = {
    Website: '#3525cd',
    Instagram: '#6063ee',
    Referral: '#d5e3fc',
  };

  // Build donut segments
  const sourceTotal = data.sources.reduce((sum, s) => sum + s.count, 0) || 1;
  let cumulativeOffset = 0;
  const donutSegments = data.sources.map((s) => {
    const pct = (s.count / sourceTotal) * 100;
    const segment = { label: s.label, pct, offset: -cumulativeOffset, stroke: sourceStrokeColors[s.label] || '#ccc' };
    cumulativeOffset += pct;
    return segment;
  });

  // Growth trend text
  const growthTrend = data.growthPct >= 0 ? `+${data.growthPct}%` : `${data.growthPct}%`;
  const growthType = data.growthPct >= 0 ? 'positive' : 'negative';

  // Qualified count for a simple "conversion" indicator
  const qualifiedCount = data.pipeline.find((p) => p.label === 'Qualified Prospects')?.count ?? 0;
  const qualifiedPct = data.totalLeads > 0 ? ((qualifiedCount / data.totalLeads) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-headline-lg text-on-surface">Analytics Performance</h2>
          <p className="text-body-md text-on-surface-variant">
            Real-time tracking of your sales pipeline from actual lead data.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-surface-container px-2 py-1 rounded-xl border border-outline-variant">
          <span className="text-label-md text-on-surface-variant px-2 py-1 rounded-lg bg-surface-container-lowest shadow-soft">
            Last 30 Days
          </span>
          <span className="text-label-md text-on-surface-variant px-2 py-1 cursor-pointer hover:bg-surface-container-lowest transition-all rounded-lg">
            All Time
          </span>
        </div>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon="group"
          iconBg="bg-primary/10"
          iconColor="text-primary"
          label="Total Leads"
          value={data.totalLeads.toLocaleString()}
          trend={growthTrend}
          trendType={growthType as 'positive' | 'negative'}
        />
        <StatCard
          icon="trending_up"
          iconBg="bg-secondary/10"
          iconColor="text-secondary"
          label="Qualified Rate"
          value={`${qualifiedPct}%`}
          trend={`${qualifiedCount} qualified`}
          trendType="neutral"
        />
        <StatCard
          icon="bar_chart"
          iconBg="bg-tertiary-container/10"
          iconColor="text-tertiary-container"
          label="Last 30 Days"
          value={data.leadsLast30Days.toLocaleString()}
          trend={growthTrend}
          trendType={growthType as 'positive' | 'negative'}
        />
        <StatCard
          icon="bolt"
          iconBg="bg-surface-container-highest"
          iconColor="text-on-surface"
          label="New Leads Today"
          value={data.leadsToday.toLocaleString()}
          trend="Today"
          trendType="neutral"
        />
      </div>

      {/* Charts Bento Grid */}
      <div className="grid grid-cols-12 gap-5">
        {/* Lead Volume Bar Chart */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-soft">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h4 className="text-headline-sm">Lead Volume Over Time</h4>
              <p className="text-label-md text-on-surface-variant">Daily leads created in the last 30 days</p>
            </div>
            <button className="p-1 hover:bg-surface-container rounded transition-colors">
              <span className="material-symbols-outlined text-[18px]">more_vert</span>
            </button>
          </div>
          {chartBars.length === 0 || data.dailyVolume.length === 0 ? (
            <div className="h-[320px] flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[48px] opacity-20 mr-2">bar_chart</span>
              No lead data in the last 30 days
            </div>
          ) : (
            <>
              <div className="h-[320px] relative w-full flex items-end justify-between gap-1 overflow-hidden">
                {chartBars.map((bar, i) => {
                  const heightPct = maxDailyCount > 0 ? (bar.count / maxDailyCount) * 100 : 0;
                  const isHighest = bar.count === maxDailyCount;
                  return (
                    <div
                      key={bar._id || i}
                      className={`flex-1 rounded-t-sm transition-all hover:opacity-80 ${
                        isHighest ? 'bg-primary' : 'bg-primary/20'
                      }`}
                      style={{ height: `${Math.max(heightPct, 2)}%` }}
                      title={`${bar._id}: ${bar.count} leads`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between mt-4 px-1 text-label-md text-on-surface-variant opacity-50">
                {data.dailyVolume.length > 0 && (
                  <>
                    <span>{new Date(data.dailyVolume[0]._id).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}</span>
                    {data.dailyVolume.length > 2 && (
                      <span>
                        {new Date(data.dailyVolume[Math.floor(data.dailyVolume.length / 2)]._id).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                      </span>
                    )}
                    <span>
                      {new Date(data.dailyVolume[data.dailyVolume.length - 1]._id).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                    </span>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Donut Chart: Leads by Source */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-soft flex flex-col">
          <h4 className="text-headline-sm mb-1">Leads by Source</h4>
          <p className="text-label-md text-on-surface-variant mb-8">Distribution by origin channel</p>
          <div className="flex-grow flex items-center justify-center relative">
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                {donutSegments.map((seg) => (
                  <circle
                    key={seg.label}
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="none"
                    stroke={seg.stroke}
                    strokeWidth="3.5"
                    strokeDasharray={`${seg.pct} ${100 - seg.pct}`}
                    strokeDashoffset={seg.offset}
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-headline-md font-semibold">
                  {sourceTotal >= 1000 ? `${(sourceTotal / 1000).toFixed(1)}k` : sourceTotal}
                </span>
                <p className="text-label-sm text-on-surface-variant">TOTAL</p>
              </div>
            </div>
          </div>
          <div className="mt-8 space-y-2">
            {data.sources.map((item) => (
              <div key={item.label} className="flex items-center justify-between text-label-md">
                <div className="flex items-center gap-1">
                  <span className={`w-3 h-3 rounded-full ${sourceColors[item.label] || 'bg-outline-variant'}`} />
                  <span className="text-on-surface">{item.label}</span>
                </div>
                <span className="font-bold">{item.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline Status Bars */}
        <div className="col-span-12 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-headline-sm">Leads by Pipeline Status</h4>
              <p className="text-label-md text-on-surface-variant">Current stage distribution from your database</p>
            </div>
            <button className="bg-surface-container-low px-4 py-2 rounded-lg text-label-md text-primary flex items-center gap-1 hover:bg-surface-container-high transition-all">
              View Leads
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
          <div className="space-y-6">
            {data.pipeline.map((item) => {
              const widthPct = pipelineMax > 0 ? (item.count / pipelineMax) * 100 : 0;
              const barColors: Record<string, string> = {
                'New Leads': 'bg-blue-500',
                Contacted: 'bg-amber-500',
                'Qualified Prospects': 'bg-emerald-500',
                Lost: 'bg-rose-500',
              };
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-label-md">
                    <span className="text-on-surface font-semibold">{item.label}</span>
                    <span className="text-on-surface-variant">
                      {item.count.toLocaleString()} Lead{item.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-low h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`${barColors[item.label] || 'bg-primary'} h-full rounded-full transition-all`}
                      style={{ width: `${Math.max(widthPct, 1)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Section: Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Insight Card */}
        <div className="md:col-span-2 bg-gradient-to-br from-primary to-secondary p-6 rounded-xl text-on-primary shadow-lg flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 space-y-4">
            <span className="bg-on-primary/20 px-2 py-1 rounded-full text-label-sm uppercase tracking-wider">
              Pipeline Insight
            </span>
            <h4 className="text-headline-md">
              {qualifiedCount > 0
                ? `You have ${qualifiedCount} qualified leads ready for outreach.`
                : 'Start adding and qualifying leads to see insights here.'}
            </h4>
            <p className="text-body-md opacity-90">
              {data.leadsToday > 0
                ? `${data.leadsToday} new lead${data.leadsToday !== 1 ? 's' : ''} added today. Keep the momentum going!`
                : 'No new leads today. Add leads to grow your pipeline.'}
            </p>
          </div>
          <div className="hidden md:flex w-48 h-48 bg-white/10 rounded-full backdrop-blur-md border border-white/20 items-center justify-center">
            <span className="material-symbols-outlined text-[64px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-soft">
          <h4 className="text-headline-sm mb-6">Quick Breakdown</h4>
          <div className="space-y-4">
            {data.pipeline.map((item) => {
              const icons: Record<string, string> = {
                'New Leads': 'fiber_new',
                Contacted: 'mark_email_read',
                'Qualified Prospects': 'verified',
                Lost: 'cancel',
              };
              return (
                <div key={item.label} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">{icons[item.label] || 'circle'}</span>
                  </div>
                  <div className="flex-grow">
                    <p className="text-label-md text-on-surface font-bold">{item.label}</p>
                    <p className="text-label-sm text-on-surface-variant">{item.count.toLocaleString()} leads</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
