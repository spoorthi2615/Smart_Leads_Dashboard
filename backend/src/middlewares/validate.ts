import type { Request, Response, NextFunction } from 'express';
import { ZodError, type ZodType } from 'zod';

/**
 * Formats Zod validation errors to the required JSON payload structure.
 */
function formatError(err: ZodError) {
  const errors = err.issues.map((e) => ({
    path: e.path.join('.'),
    message: e.message,
  }));
  return { success: false, errors };
}

/** Validate request body */
export const validateBody = <T>(schema: ZodType<T>) => (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = schema.parse(req.body);
    req.validatedBody = parsed;
    next();
  } catch (e) {
    if (e instanceof ZodError) {
      res.status(400).json(formatError(e));
    } else {
      next(e);
    }
  }
};

/** Validate query parameters */
export const validateQuery = <T>(schema: ZodType<T>) => (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = schema.parse(req.query);
    req.validatedQuery = parsed;
    next();
  } catch (e) {
    if (e instanceof ZodError) {
      res.status(400).json(formatError(e));
    } else {
      next(e);
    }
  }
};

/** Validate URL/path parameters */
export const validateParams = <T>(schema: ZodType<T>) => (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = schema.parse(req.params);
    req.validatedParams = parsed;
    next();
  } catch (e) {
    if (e instanceof ZodError) {
      res.status(400).json(formatError(e));
    } else {
      next(e);
    }
  }
};
