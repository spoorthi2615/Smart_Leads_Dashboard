import { z } from 'zod';

/* Auth */
export const registerSchema = z.object({
  name: z.string().trim().min(1, { message: 'Name is required' }).max(120, { message: 'Name is too long' }),
  email: z.string().email({ message: 'Valid email required' }).transform((e: string) => e.toLowerCase()),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  role: z.enum(['Admin', 'Sales User']).optional().default('Sales User'),
});

export const loginSchema = z.object({
  email: z.string().email({ message: 'Valid email required' }).transform((e: string) => e.toLowerCase()),
  password: z.string().min(1, { message: 'Password is required' }),
});

/* Lead */
export const leadCreateSchema = z.object({
  name: z.string().trim().min(1, { message: 'Lead name is required' }).max(120, { message: 'Lead name is too long' }),
  email: z.string().email({ message: 'Valid email required' }).transform((e: string) => e.toLowerCase()),
  status: z.enum(['New', 'Contacted', 'Qualified', 'Lost'] as const),
  source: z.enum(['Website', 'Instagram', 'Referral'] as const),
});

export const leadUpdateSchema = leadCreateSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: 'At least one lead field is required',
});

export const leadQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  sort: z.enum(['asc', 'desc']).optional().default('desc'),
  status: z.enum(['New', 'Contacted', 'Qualified', 'Lost'] as const).optional(),
  source: z.enum(['Website', 'Instagram', 'Referral'] as const).optional(),
  search: z.string().trim().max(120).optional(),
});

export const leadIdParamSchema = z.object({
  id: z.string().regex(/^[a-f0-9]{24}$/, { message: 'Invalid lead ID' }),
});

export type RegisterDTO = z.infer<typeof registerSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
export type LeadCreateDTO = z.infer<typeof leadCreateSchema>;
export type LeadUpdateDTO = z.infer<typeof leadUpdateSchema>;
export type LeadQueryDTO = z.infer<typeof leadQuerySchema>;
export type LeadIdParams = z.infer<typeof leadIdParamSchema>;
