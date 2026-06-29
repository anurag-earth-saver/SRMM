// ─── CORS Config ────────────────────────────────────────────────────────────
import type { CorsOptions } from 'cors';
import { config } from './index.js';

export const corsOptions: CorsOptions = {
  origin: config.corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
};
