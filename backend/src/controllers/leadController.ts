import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Lead } from '../models/Lead.js';
import type { ILead, LeadSource, LeadStatus } from '../models/Lead.js';

type PopulatedAuthor = {
  _id: unknown;
  name: string;
  email: string;
  role: string;
};

type PopulatedLead = ILead & {
  createdBy: PopulatedAuthor;
};

interface PaginationResponse {
  data: Array<{
    id: string;
    name: string;
    email: string;
    status: LeadStatus;
    source: LeadSource;
    createdAt: Date;
    updatedAt: Date;
    createdBy: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  }>;
  meta: {
    totalDocs: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}

function serializeLead(lead: PopulatedLead) {
  return {
    id: lead._id.toString(),
    name: lead.name,
    email: lead.email,
    status: lead.status,
    source: lead.source,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
    createdBy: {
      id: String(lead.createdBy._id),
      name: lead.createdBy.name,
      email: lead.createdBy.email,
      role: lead.createdBy.role,
    },
  };
}

export async function createLead(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const { name, email, status, source } = req.body as {
    name?: string;
    email?: string;
    status?: LeadStatus;
    source?: LeadSource;
  };

  if (!name || !email || !status || !source) {
    res.status(400).json({ success: false, message: 'All lead fields are required' });
    return;
  }

  const createdLead = await Lead.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    status,
    source,
    createdBy: new Types.ObjectId(req.user.id),
  });

  const lead = await Lead.findById(createdLead._id).populate('createdBy', 'name email role');

  if (!lead) {
    res.status(500).json({ success: false, message: 'Failed to serialize created lead' });
    return;
  }

  res.status(201).json({ success: true, data: serializeLead(lead as unknown as PopulatedLead) });
}

export async function getLeads(req: Request, res: Response): Promise<void> {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  const requestedStatus = typeof req.query.status === 'string' ? (req.query.status as LeadStatus) : undefined;
  const requestedSource = typeof req.query.source === 'string' ? (req.query.source as LeadSource) : undefined;
  const searchTerm = typeof req.query.search === 'string' ? req.query.search.trim() : undefined;

  const query: Record<string, unknown> = {};

  if (requestedStatus) {
    query.status = requestedStatus;
  }

  if (requestedSource) {
    query.source = requestedSource;
  }

  if (searchTerm) {
    query.$or = [
      { name: { $regex: searchTerm, $options: 'i' } },
      { email: { $regex: searchTerm, $options: 'i' } },
    ];
  }

  const skip = Math.max(page - 1, 0) * limit;

  const [totalDocs, leads] = await Promise.all([
    Lead.countDocuments(query),
    Lead.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('createdBy', 'name email role'),
  ]);

  const totalPages = Math.max(Math.ceil(totalDocs / limit), 1);

  const response: PaginationResponse = {
    data: leads.map((lead) => serializeLead(lead as unknown as PopulatedLead)),
    meta: {
      totalDocs,
      totalPages,
      page,
      limit,
    },
  };

  res.status(200).json({ success: true, ...response });
}

export async function getLeadById(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);

  if (!Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid lead ID' });
    return;
  }

  const lead = await Lead.findById(id).populate('createdBy', 'name email role');

  if (!lead) {
    res.status(404).json({ success: false, message: 'Lead not found' });
    return;
  }

  res.status(200).json({ success: true, data: serializeLead(lead as unknown as PopulatedLead) });
}

type LeadUpdates = Partial<{
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
}>;

export async function updateLead(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);

  if (!Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid lead ID' });
    return;
  }

  const updates = req.body as LeadUpdates;
  const allowedUpdates = ['name', 'email', 'status', 'source'] as const;
  const payload: Record<string, string> = {};

  for (const field of allowedUpdates) {
    const value = updates[field];
    if (typeof value === 'string' && value.trim()) {
      payload[field] = value.trim();
    }
  }

  const lead = await Lead.findByIdAndUpdate(id, payload as Record<string, unknown>, {
    new: true,
    runValidators: true,
  }).populate('createdBy', 'name email role');

  if (!lead) {
    res.status(404).json({ success: false, message: 'Lead not found' });
    return;
  }

  res.status(200).json({ success: true, data: serializeLead(lead as unknown as PopulatedLead) });
}

export async function deleteLead(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);

  if (!Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid lead ID' });
    return;
  }

  const lead = await Lead.findByIdAndDelete(id);

  if (!lead) {
    res.status(404).json({ success: false, message: 'Lead not found' });
    return;
  }

  res.status(200).json({ success: true, message: 'Lead deleted successfully' });
}
