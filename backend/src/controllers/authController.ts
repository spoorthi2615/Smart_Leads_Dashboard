import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, type IUser, type UserRole } from '../models/User.js';
import type { RegisterDTO, LoginDTO } from '../validation/schemas.js';
import { env } from '../config/env.js';

interface AuthPayload {
  id: string;
  role: UserRole;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

/**
 * Creates a JWT token with the given payload
 * WHY: Centralized token creation with validated secret from env
 * - Uses validated JWT_SECRET from environment config
 * - Sets consistent expiration (2 hours)
 * - Fails fast if secret is not configured
 */
function createToken(payload: AuthPayload): string {
  const secret = env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(payload, secret, {
    expiresIn: '2h',
    algorithm: 'HS256',
  });
}

export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password, role } = req.validatedBody as RegisterDTO;

  const normalizedEmail = email.toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    res.status(409).json({ success: false, message: 'Email is already registered' });
    return;
  }

  const newUser = await User.create({
    name: name.trim(),
    email: normalizedEmail.trim(),
    password,
    role: role ?? 'Sales User',
  });

  const token = createToken({ id: newUser.id, role: newUser.role });

  const response: AuthResponse = {
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
  };

  res.status(201).json({ success: true, data: response });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.validatedBody as LoginDTO;

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    res.status(401).json({ success: false, message: 'Invalid email or password' });
    return;
  }

  const token = createToken({ id: user.id, role: user.role });

  const response: AuthResponse = {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };

  res.status(200).json({ success: true, data: response });
}

export async function getMe(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404).json({ success: false, message: 'Authenticated user not found' });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}
