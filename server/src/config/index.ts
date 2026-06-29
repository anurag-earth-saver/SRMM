// ─── Server Configuration ───────────────────────────────────────────────────
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env['PORT'] ?? '3001', 10),
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  maxFileSizeMB: parseInt(process.env['MAX_FILE_SIZE_MB'] ?? '50', 10),
  uploadDir: process.env['UPLOAD_DIR'] ?? './uploads',
  corsOrigin: process.env['CORS_ORIGIN'] ?? 'http://localhost:5173',
} as const;
