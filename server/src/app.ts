// ─── Express App Factory ────────────────────────────────────────────────────
import express from 'express';
import cors from 'cors';
import { corsOptions } from './config/cors.js';
import { requestLogger } from './middleware/requestLogger.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { createRoutes } from './routes/index.js';
import { AnalysisService } from './services/analysis/AnalysisService.js';

export function createApp() {
  const app = express();

  // Dependency injection
  const analysisService = new AnalysisService();

  // Global middleware
  app.use(cors(corsOptions));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);
  app.use(rateLimiter);

  // API Routes
  app.use('/api', createRoutes(analysisService));

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
