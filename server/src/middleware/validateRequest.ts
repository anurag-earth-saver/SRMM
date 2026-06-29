// ─── Zod Validation Middleware ───────────────────────────────────────────────
import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { ZodSchema } from 'zod';

export function validateRequest(schema: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (schema.body) req.body = schema.body.parse(req.body);
    if (schema.query) req.query = schema.query.parse(req.query) as typeof req.query;
    if (schema.params) req.params = schema.params.parse(req.params) as typeof req.params;
    next();
  };
}
