export type UserPayload = {
  id: string;
  email: string;
  role: 'Admin' | 'Sales User';
};

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
      validatedBody?: unknown;
      validatedQuery?: unknown;
      validatedParams?: unknown;
    }
  }
}

export {};
