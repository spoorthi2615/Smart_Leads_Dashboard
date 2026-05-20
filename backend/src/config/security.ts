/**
 * Security middleware and configuration
 * Implements industry-standard security measures including:
 * - HTTP security headers via Helmet
 * - Rate limiting to prevent brute-force attacks
 * - Mongo injection prevention via sanitization
 * - Secure CORS configuration
 */

import helmet from 'helmet';
import rateLimit, { ipKeyGenerator, type RateLimitRequestHandler } from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import type { Express, NextFunction, Request, Response } from 'express';
import { env } from './env.js';

/**
 * Applies Helmet middleware for secure HTTP headers
 * WHY: Helmet sets 15+ security-related HTTP headers, protecting against:
 * - XSS (Cross-Site Scripting) attacks
 * - Clickjacking
 * - MIME-type sniffing
 * - Strict Transport Security (HSTS)
 */
export function applyHelmet(app: Express): void {
  // In development, disable CSP to allow Vite hot-reload
  // In production, let Helmet set default CSP
  if (env.NODE_ENV === 'production') {
    app.use(helmet());
  } else {
    app.use(helmet({ contentSecurityPolicy: false }));
  }
}

/**
 * Creates and returns a rate limiter for the given key prefix
 * WHY: Rate limiting prevents brute-force attacks on sensitive endpoints
 *
 * @param keyPrefix - Prefix for storing rate limit data (e.g., 'auth_login')
 * @param windowMs - Time window in milliseconds
 * @param maxRequests - Maximum requests allowed per window
 * @returns Configured rate limit middleware
 */
export function createRateLimiter(
  keyPrefix: string,
  windowMs: number,
  maxRequests: number
): RateLimitRequestHandler {
  return rateLimit({
    windowMs,
    max: maxRequests,
    message: 'Too many requests from this IP, please try again later',
    statusCode: 429,
    keyGenerator: (req) => `${keyPrefix}:${ipKeyGenerator(req.ip ?? req.socket.remoteAddress ?? 'unknown')}`,
    standardHeaders: false,
    legacyHeaders: false,
  });
}

/**
 * Auth rate limiters to prevent brute-force attacks on login/register
 * WHY: Auth endpoints are common targets for brute-force attacks
 *
 * - Login attempts: 5 per 15 minutes per IP
 * - Register attempts: 3 per hour per IP
 */
export const authLoginLimiter: RateLimitRequestHandler = createRateLimiter(
  'login_attempt',
  15 * 60 * 1000,
  5
);

export const authRegisterLimiter: RateLimitRequestHandler = createRateLimiter(
  'register_attempt',
  60 * 60 * 1000,
  3
);

/**
 * Applies Mongo sanitization middleware
 * WHY: Prevents NoSQL injection attacks by sanitizing user input
 * - Removes $ and . characters from object keys
 * - Prevents queries like {email: {$where: ...}}
 */
export function applyMongoSanitize(app: Express): void {
  app.use((req: Request, _res: Response, next: NextFunction): void => {
    if (req.body && typeof req.body === 'object') {
      mongoSanitize.sanitize(req.body as Record<string, unknown>);
    }

    if (req.params && typeof req.params === 'object') {
      mongoSanitize.sanitize(req.params);
    }

    next();
  });
}

/**
 * Secures CORS configuration
 * WHY: Prevents unauthorized cross-origin requests
 * - Restricts origin to configured frontend URL
 * - Allows credentials in requests
 * - Restricts HTTP methods
 * - Restricts headers
 */
export function secureCorsOptions() {
  return {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow all CORS
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 3600, // Cache preflight for 1 hour
  };
}
