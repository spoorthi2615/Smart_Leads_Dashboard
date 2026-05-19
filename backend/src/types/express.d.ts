export type UserPayload = {
  id: string;
  email: string;
  role: 'Admin' | 'Sales User';
};

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
