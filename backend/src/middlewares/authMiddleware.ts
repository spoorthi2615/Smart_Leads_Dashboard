import type { NextFunction, Request, Response } from 'express';
import jwt, { type JwtPayload, type Secret } from 'jsonwebtoken';
import { User, type UserRole } from '../models/User.js';
import type { UserPayload } from '../types/express.d.ts';
import { env } from '../config/env.js';

export async function protect(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  // WHY: Strict validation of Authorization header format
  // Prevents accepting malformed or missing tokens
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authorization token missing or malformed' });
    return;
  }

  const token = authHeader.slice(7); // Remove 'Bearer ' prefix

  // WHY: Verify token is not empty after extraction
  if (!token || token.length === 0) {
    res.status(401).json({ success: false, message: 'Authorization token missing or malformed' });
    return;
  }

  // WHY: Use validated JWT_SECRET from environment config instead of process.env directly
  // Ensures configuration has been validated at startup
  const secret = env.JWT_SECRET as Secret;

  try {
    // WHY: Strict JWT verification with type checking
    // jwt.verify returns JwtPayload or string; we explicitly check and reject string type
    const decoded = jwt.verify(token, secret) as JwtPayload | UserPayload;

    // WHY: Type guard to ensure decoded is an object, not a string
    // This protects against edge cases where jwt.verify might return a string
    if (!decoded || typeof decoded === 'string') {
      res.status(401).json({ success: false, message: 'Invalid token payload' });
      return;
    }

    // WHY: Explicit check for required 'id' field in token payload
    // Ensures token structure matches expected authentication payload
    const userId = 'id' in decoded ? decoded.id : undefined;

    if (!userId || typeof userId !== 'string') {
      res.status(401).json({ success: false, message: 'Invalid token payload structure' });
      return;
    }

    // WHY: Verify user still exists in database
    // Prevents access with tokens from deleted users
    const user = await User.findById(userId).select('+password');

    if (!user) {
      res.status(401).json({ success: false, message: 'User not found for provided token' });
      return;
    }

    // WHY: Attach user to request with typed payload
    // Ensures downstream handlers have access to authenticated user
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    // WHY: Differentiate between different JWT errors for better debugging
    // and appropriate error messages

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, message: 'Token has expired' });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ success: false, message: 'Invalid token' });
      return;
    }

    // WHY: Generic error handler for unexpected errors during token verification
    console.error('Token verification error:', error);
    res.status(401).json({ success: false, message: 'Token verification failed' });
  }
}

/**
 * Role‑Based Access Control middleware.
 * Accepts any number of allowed roles (UserRole enum) and checks the
 * authenticated user attached by `protect`. Returns 403 if the user's role
 * is not permitted.
 */
export function restrictTo(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role as UserRole)) {
      res.status(403).json({ success: false, message: 'Insufficient permissions' });
      return;
    }

    next();
  };
}
