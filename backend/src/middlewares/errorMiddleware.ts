import type { ErrorRequestHandler } from 'express';
import { env } from '../config/env.js';

interface AppError extends Error {
  statusCode?: number;
}

/**
 * Global error handling middleware
 * WHY: Centralized error handling with security considerations:
 * - Never exposes stack traces in production
 * - Provides consistent error response format
 * - Logs errors for debugging while protecting user privacy
 */
export const errorMiddleware: ErrorRequestHandler = (err: AppError, _req, res, _next) => {
  const statusCode = err.statusCode ?? 500;

  // WHY: In production, never expose stack traces or internal error details
  // This prevents attackers from learning about the application structure
  const isDevelopment = env.NODE_ENV === 'development';

  const response = {
    success: false,
    message: err.message ?? 'Internal Server Error',
    ...(isDevelopment && { stack: err.stack }),
  };

  // WHY: Always log errors server-side for debugging and monitoring
  // but don't expose details to the client in production
  console.error(`[${new Date().toISOString()}] Error:`, {
    statusCode,
    message: err.message,
    ...(isDevelopment && { stack: err.stack }),
  });

  res.status(statusCode).json(response);
};
