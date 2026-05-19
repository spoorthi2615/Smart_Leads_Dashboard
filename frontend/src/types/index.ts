export type UserRole = 'Admin' | 'Sales User';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Lost';
export type LeadSource = 'Website' | 'Instagram' | 'Referral';

export interface LeadAuthor {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  createdBy: LeadAuthor;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationData {
  page: number;
  limit: number;
  totalDocs: number;
  totalPages: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
}
