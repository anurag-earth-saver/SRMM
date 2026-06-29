// ─── File Upload Middleware ──────────────────────────────────────────────────
import multer from 'multer';
import path from 'path';
import { config } from '../config/index.js';

const storage = multer.diskStorage({
  destination: config.uploadDir,
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: config.maxFileSizeMB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed.'));
    }
  },
});
