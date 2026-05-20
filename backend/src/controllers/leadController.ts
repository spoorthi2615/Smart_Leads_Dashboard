import type { Request, Response } from 'express';
import { Readable } from 'stream';
import { Transform as Json2CsvTransform } from 'json2csv';
import { Types } from 'mongoose';
import { Lead } from '../models/Lead.js';
import type { ILead, LeadSource, LeadStatus } from '../models/Lead.js';
import type { LeadCreateDTO, LeadUpdateDTO, LeadQueryDTO, LeadIdParams } from '../validation/schemas.js';

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

interface LeadExportRow {
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  createdByName: string;
  createdByEmail: string;
  createdAt: string;
  updatedAt: string;
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

function buildLeadQuery({ status, source, search }: Pick<LeadQueryDTO, 'status' | 'source' | 'search'>): Record<string, unknown> {
  const query: Record<string, unknown> = {};
  const searchTerm = search?.trim();

  if (status) {
    query.status = status;
  }

  if (source) {
    query.source = source;
  }

  if (searchTerm) {
    query.$or = [
      { name: { $regex: searchTerm, $options: 'i' } },
      { email: { $regex: searchTerm, $options: 'i' } },
    ];
  }

  return query;
}

export async function createLead(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const { name, email, status, source } = req.validatedBody as LeadCreateDTO;

  // No additional field presence checks needed; schema validation ensures required fields.


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
  const { page, limit, sort, status, source, search } = req.validatedQuery as LeadQueryDTO;
  const sortOrder = sort === 'asc' ? 1 : -1;

  const query = buildLeadQuery({ status, source, search });

  const skip = Math.max(page - 1, 0) * limit;

  const [totalDocs, leads] = await Promise.all([
    Lead.countDocuments(query),
    Lead.find(query).sort({ createdAt: sortOrder }).skip(skip).limit(limit).populate('createdBy', 'name email role'),
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

export async function exportLeads(req: Request, res: Response): Promise<void> {
  const { sort, status, source, search } = req.validatedQuery as LeadQueryDTO;
  const sortOrder = sort === 'asc' ? 1 : -1;
  const query = buildLeadQuery({ status, source, search });

  const fields = [
    { label: 'Name', value: 'name' },
    { label: 'Email', value: 'email' },
    { label: 'Status', value: 'status' },
    { label: 'Source', value: 'source' },
    { label: 'Created By', value: 'createdByName' },
    { label: 'Created By Email', value: 'createdByEmail' },
    { label: 'Created At', value: 'createdAt' },
    { label: 'Updated At', value: 'updatedAt' },
  ];

  async function* rows(): AsyncGenerator<LeadExportRow> {
    const cursor = Lead.find(query)
      .sort({ createdAt: sortOrder })
      .populate('createdBy', 'name email role')
      .cursor();

    for await (const lead of cursor) {
      const serializedLead = serializeLead(lead as unknown as PopulatedLead);
      yield {
        name: serializedLead.name,
        email: serializedLead.email,
        status: serializedLead.status,
        source: serializedLead.source,
        createdByName: serializedLead.createdBy.name,
        createdByEmail: serializedLead.createdBy.email,
        createdAt: serializedLead.createdAt.toISOString(),
        updatedAt: serializedLead.updatedAt.toISOString(),
      };
    }
  }

  const fileDate = new Date().toISOString().slice(0, 10);
  res.status(200);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="smart-leads-${fileDate}.csv"`);

  const csvTransform = new Json2CsvTransform<LeadExportRow>({ fields }, { objectMode: true });

  Readable.from(rows()).pipe(csvTransform).pipe(res);
}

export async function getLeadById(req: Request, res: Response): Promise<void> {
  const { id } = req.validatedParams as LeadIdParams;


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
  const { id } = req.validatedParams as LeadIdParams;

  const updates = req.validatedBody as LeadUpdateDTO;
  // Only include provided fields; Zod already filters undefined
  const payload: LeadUpdates = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.email !== undefined) payload.email = updates.email;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.source !== undefined) payload.source = updates.source;


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
  const { id } = req.validatedParams as LeadIdParams;

  const lead = await Lead.findByIdAndDelete(id);

  if (!lead) {
    res.status(404).json({ success: false, message: 'Lead not found' });
    return;
  }

  res.status(200).json({ success: true, message: 'Lead deleted successfully' });
}
