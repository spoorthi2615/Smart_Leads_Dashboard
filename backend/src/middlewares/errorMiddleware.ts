import type { ErrorRequestHandler } from 'express';

interface AppError extends Error {
  statusCode?: number;
}

export const errorMiddleware: ErrorRequestHandler = (err: AppError, _req, res, _next) => {
  const statusCode = err.statusCode ?? 500;
  const response = {
    success: false,
    message: err.message ?? 'Internal Server Error',
    stack: err.stack ?? '',
  };

  console.error('Unhandled error:', err);
  res.status(statusCode).json(response);
};
