// ─── Zod Validation Schemas ─────────────────────────────────────────────────
import { z } from 'zod';

export const analysisIdSchema = z.object({
  id: z.string().uuid('Invalid analysis ID.'),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});
