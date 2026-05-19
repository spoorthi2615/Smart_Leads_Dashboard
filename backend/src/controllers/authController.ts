import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, type IUser, type UserRole } from '../models/User.js';

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

function createToken(payload: AuthPayload): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(payload, secret, { expiresIn: '2h' });
}

export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password, role } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    role?: UserRole;
  };

  if (!name || !email || !password) {
    res.status(400).json({ success: false, message: 'Name, email and password are required' });
    return;
  }

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
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    res.status(400).json({ success: false, message: 'Email and password are required' });
    return;
  }

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
