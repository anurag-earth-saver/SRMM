// ─── Rate Limiter Middleware ─────────────────────────────────────────────────
import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many requests.' } },
});

export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Upload rate limit exceeded.' } },
});
