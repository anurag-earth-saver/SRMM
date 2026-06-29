// ─── Server Configuration ───────────────────────────────────────────────────
import dotenv from 'dotenv';
import fs from 'node:fs';
dotenv.config();

const isVercel = Boolean(process.env['VERCEL']);
const defaultUploadDir = isVercel ? '/tmp/uploads' : './uploads';

const uploadDir = process.env['UPLOAD_DIR'] ?? defaultUploadDir;
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export const config = {
  port: parseInt(process.env['PORT'] ?? '3001', 10),
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  maxFileSizeMB: parseInt(process.env['MAX_FILE_SIZE_MB'] ?? '50', 10),
  uploadDir,
  corsOrigin: process.env['CORS_ORIGIN'] ?? (isVercel ? '*' : 'http://localhost:5173'),
  isVercel,
} as const;
