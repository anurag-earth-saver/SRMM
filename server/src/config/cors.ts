// ─── CORS Config ────────────────────────────────────────────────────────────
import type { CorsOptions } from 'cors';
import { config } from './index.js';

function resolveOrigin(): CorsOptions['origin'] {
  if (config.corsOrigin === '*') return true;
  const origins = config.corsOrigin.split(',').map((o) => o.trim());
  if (origins.length === 1) return origins[0];
  return origins;
}

export const corsOptions: CorsOptions = {
  origin: resolveOrigin(),
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
};
