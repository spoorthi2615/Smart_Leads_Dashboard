import type { Request, Response } from 'express';
import { Lead } from '../models/Lead.js';

interface StatusCount {
  _id: string;
  count: number;
}

interface SourceCount {
  _id: string;
  count: number;
}

interface DailyCount {
  _id: string;
  count: number;
}

export async function getAnalytics(_req: Request, res: Response): Promise<void> {
  const now = new Date();

  // Start of today (midnight UTC)
  const startOfToday = new Date(now);
  startOfToday.setUTCHours(0, 0, 0, 0);

  // 30 days ago
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalLeads,
    leadsToday,
    statusBreakdown,
    sourceBreakdown,
    dailyVolume,
    totalLeads30DaysAgo,
  ] = await Promise.all([
    // Total lead count
    Lead.countDocuments(),

    // Leads created today
    Lead.countDocuments({ createdAt: { $gte: startOfToday } }),

    // Leads grouped by status
    Lead.aggregate<StatusCount>([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),

    // Leads grouped by source
    Lead.aggregate<SourceCount>([
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),

    // Daily lead volume for last 30 days
    Lead.aggregate<DailyCount>([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    // Total leads as of 30 days ago (for growth calculation)
    Lead.countDocuments({ createdAt: { $lt: thirtyDaysAgo } }),
  ]);

  // Calculate growth percentage
  const leadsLast30Days = totalLeads - totalLeads30DaysAgo;
  const growthPct =
    totalLeads30DaysAgo > 0
      ? Math.round((leadsLast30Days / totalLeads30DaysAgo) * 100)
      : leadsLast30Days > 0
        ? 100
        : 0;

  // Build status map
  const statusMap: Record<string, number> = {};
  for (const item of statusBreakdown) {
    statusMap[item._id] = item.count;
  }

  // Build source map
  const sourceMap: Record<string, number> = {};
  for (const item of sourceBreakdown) {
    sourceMap[item._id] = item.count;
  }

  // Pipeline stages (derived from status counts)
  const pipeline = [
    { label: 'New Leads', count: statusMap['New'] ?? 0 },
    { label: 'Contacted', count: statusMap['Contacted'] ?? 0 },
    { label: 'Qualified Prospects', count: statusMap['Qualified'] ?? 0 },
    { label: 'Lost', count: statusMap['Lost'] ?? 0 },
  ];

  // Source percentages
  const sourceTotal = totalLeads || 1;
  const sources = [
    { label: 'Website', count: sourceMap['Website'] ?? 0, pct: Math.round(((sourceMap['Website'] ?? 0) / sourceTotal) * 100) },
    { label: 'Instagram', count: sourceMap['Instagram'] ?? 0, pct: Math.round(((sourceMap['Instagram'] ?? 0) / sourceTotal) * 100) },
    { label: 'Referral', count: sourceMap['Referral'] ?? 0, pct: Math.round(((sourceMap['Referral'] ?? 0) / sourceTotal) * 100) },
  ];

  res.status(200).json({
    success: true,
    data: {
      totalLeads,
      leadsToday,
      growthPct,
      leadsLast30Days,
      pipeline,
      sources,
      dailyVolume,
    },
  });
}
