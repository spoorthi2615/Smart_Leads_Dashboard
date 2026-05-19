import StatCard from '../components/StatCard';

const barHeights = ['40%', '55%', '45%', '70%', '85%', '60%', '75%', '65%', '40%', '55%', '95%', '80%'];
const barLabels = ['01 May', '07 May', '14 May', '21 May', '30 May'];

const pipelineData = [
  { label: 'Discovery Stage', count: '4,281 Leads', width: '85%', color: 'bg-primary' },
  { label: 'Qualified Prospects', count: '2,150 Leads', width: '45%', color: 'bg-secondary' },
  { label: 'Proposal Sent', count: '892 Leads', width: '22%', color: 'bg-tertiary-container' },
  { label: 'Negotiation', count: '340 Leads', width: '12%', color: 'bg-surface-variant' },
];

const topExecs = [
  { name: 'Marcus Chen', conversions: 82, initials: 'MC', showBadge: true },
  { name: 'Elena Rodriguez', conversions: 74, initials: 'ER', showBadge: false },
  { name: 'David Vance', conversions: 69, initials: 'DV', showBadge: false },
];

export default function Analytics() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-headline-lg text-on-surface">Analytics Performance</h2>
          <p className="text-body-md text-on-surface-variant">
            Real-time tracking of your sales pipeline and conversion efficiency.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-surface-container px-2 py-1 rounded-xl border border-outline-variant">
          <span className="text-label-md text-on-surface-variant px-2 py-1 rounded-lg bg-surface-container-lowest shadow-soft">
            Last 30 Days
          </span>
          <span className="text-label-md text-on-surface-variant px-2 py-1 cursor-pointer hover:bg-surface-container-lowest transition-all rounded-lg">
            Last Quarter
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
          value="12,482"
          trend="+12%"
          trendType="positive"
        />
        <StatCard
          icon="trending_up"
          iconBg="bg-secondary/10"
          iconColor="text-secondary"
          label="Conversion Rate"
          value="24.8%"
          trend="-2%"
          trendType="negative"
        />
        <StatCard
          icon="payments"
          iconBg="bg-tertiary-container/10"
          iconColor="text-tertiary-container"
          label="Revenue Growth"
          value="$142,500"
          trend="+18.4%"
          trendType="positive"
        />
        <StatCard
          icon="bolt"
          iconBg="bg-surface-container-highest"
          iconColor="text-on-surface"
          label="New Leads Today"
          value="154"
          trend="New"
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
              <p className="text-label-md text-on-surface-variant">Daily aggregate of incoming prospect signals</p>
            </div>
            <button className="p-1 hover:bg-surface-container rounded transition-colors">
              <span className="material-symbols-outlined text-[18px]">more_vert</span>
            </button>
          </div>
          <div className="h-[320px] relative w-full flex items-end justify-between gap-1 overflow-hidden">
            {barHeights.map((h, i) => (
              <div
                key={i}
                className={`flex-1 rounded-t-sm transition-all hover:opacity-80 ${
                  h === '85%' || h === '95%' ? 'bg-primary' : 'bg-primary/20'
                }`}
                style={{ height: h }}
              />
            ))}
            {/* SVG Line overlay */}
            <svg className="absolute inset-0 h-full w-full pointer-events-none" preserveAspectRatio="none">
              <path
                d="M0,280 Q100,200 200,240 T400,100 T600,180 T800,50"
                fill="none"
                stroke="#3525cd"
                strokeLinecap="round"
                strokeWidth="3"
              />
            </svg>
          </div>
          <div className="flex justify-between mt-4 px-1 text-label-md text-on-surface-variant opacity-50">
            {barLabels.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
        </div>

        {/* Donut Chart: Leads by Source */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-soft flex flex-col">
          <h4 className="text-headline-sm mb-1">Leads by Source</h4>
          <p className="text-label-md text-on-surface-variant mb-8">Distribution by origin channel</p>
          <div className="flex-grow flex items-center justify-center relative">
            {/* CSS Donut */}
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                {/* Website 54% */}
                <circle
                  cx="18" cy="18" r="15.9155"
                  fill="none"
                  stroke="#3525cd"
                  strokeWidth="3.5"
                  strokeDasharray="54 46"
                  strokeDashoffset="0"
                />
                {/* Instagram 29% */}
                <circle
                  cx="18" cy="18" r="15.9155"
                  fill="none"
                  stroke="#6063ee"
                  strokeWidth="3.5"
                  strokeDasharray="29 71"
                  strokeDashoffset="-54"
                />
                {/* Referral 17% */}
                <circle
                  cx="18" cy="18" r="15.9155"
                  fill="none"
                  stroke="#d5e3fc"
                  strokeWidth="3.5"
                  strokeDasharray="17 83"
                  strokeDashoffset="-83"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-headline-md font-semibold">12.4k</span>
                <p className="text-label-sm text-on-surface-variant">TOTAL</p>
              </div>
            </div>
          </div>
          <div className="mt-8 space-y-2">
            {[
              { color: 'bg-primary', label: 'Website', pct: '54%' },
              { color: 'bg-secondary-container', label: 'Instagram', pct: '29%' },
              { color: 'bg-surface-variant', label: 'Referral', pct: '17%' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between text-label-md">
                <div className="flex items-center gap-1">
                  <span className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-on-surface">{item.label}</span>
                </div>
                <span className="font-bold">{item.pct}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline Status Bars */}
        <div className="col-span-12 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-headline-sm">Leads by Pipeline Status</h4>
              <p className="text-label-md text-on-surface-variant">Current stage distribution across all funnels</p>
            </div>
            <button className="bg-surface-container-low px-4 py-2 rounded-lg text-label-md text-primary flex items-center gap-1 hover:bg-surface-container-high transition-all">
              View Pipeline
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
          <div className="space-y-6">
            {pipelineData.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-label-md">
                  <span className="text-on-surface font-semibold">{item.label}</span>
                  <span className="text-on-surface-variant">{item.count}</span>
                </div>
                <div className="w-full bg-surface-container-low h-2.5 rounded-full overflow-hidden">
                  <div className={`${item.color} h-full rounded-full transition-all`} style={{ width: item.width }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Campaign Insight + Top Execs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Campaign Insight Card */}
        <div className="md:col-span-2 bg-gradient-to-br from-primary to-secondary p-6 rounded-xl text-on-primary shadow-lg flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 space-y-4">
            <span className="bg-on-primary/20 px-2 py-1 rounded-full text-label-sm uppercase tracking-wider">
              Campaign Insight
            </span>
            <h4 className="text-headline-md">
              Your 'Summer Growth' campaign is outperforming projections by 24%.
            </h4>
            <p className="text-body-md opacity-90">
              Maximize your ROI by allocating 15% more budget to Instagram referrals based on current conversion velocity.
            </p>
            <button className="bg-white text-primary px-6 py-2 rounded-full text-label-md font-bold shadow-xl hover:scale-105 transition-transform">
              Optimize Budget
            </button>
          </div>
          <div className="hidden md:flex w-48 h-48 bg-white/10 rounded-full backdrop-blur-md border border-white/20 items-center justify-center">
            <span className="material-symbols-outlined text-[64px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
          </div>
        </div>

        {/* Top Sales Execs */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-soft">
          <h4 className="text-headline-sm mb-6">Top Sales Execs</h4>
          <div className="space-y-4">
            {topExecs.map((exec) => (
              <div key={exec.name} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-label-md">
                  {exec.initials}
                </div>
                <div className="flex-grow">
                  <p className="text-label-md text-on-surface font-bold">{exec.name}</p>
                  <p className="text-label-sm text-on-surface-variant">{exec.conversions} conversions</p>
                </div>
                {exec.showBadge && (
                  <span className="material-symbols-outlined text-tertiary-fixed-dim">workspace_premium</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
