import type { NextFunction, Request, Response } from 'express';
import jwt, { type JwtPayload, type Secret } from 'jsonwebtoken';
import { User } from '../models/User.js';
import type { UserPayload } from '../types/express.d.ts';

export async function protect(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authorization token missing or malformed' });
    return;
  }

  const [, token] = authHeader.split(' ');
  const secret = process.env.JWT_SECRET as Secret;

  if (!token) {
    res.status(401).json({ success: false, message: 'Authorization token missing or malformed' });
    return;
  }

  if (!secret) {
    res.status(500).json({ success: false, message: 'JWT_SECRET is not configured' });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret as unknown as string) as JwtPayload | UserPayload;

    if (!decoded || typeof decoded === 'string') {
      res.status(401).json({ success: false, message: 'Invalid token payload' });
      return;
    }

    const userId = 'id' in decoded ? decoded.id : undefined;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Invalid token payload structure' });
      return;
    }

    const user = await User.findById(userId).select('+password');

    if (!user) {
      res.status(401).json({ success: false, message: 'User not found for provided token' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

export function restrictTo(...roles: Array<'Admin' | 'Sales User'>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Insufficient permissions' });
      return;
    }

    next();
  };
}
