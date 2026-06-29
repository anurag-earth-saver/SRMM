// ─── Route Aggregator ───────────────────────────────────────────────────────
import { Router } from 'express';
import { uploadMiddleware } from '../middleware/fileUpload.js';
import { uploadRateLimiter } from '../middleware/rateLimiter.js';
import type { AnalysisService } from '../services/analysis/AnalysisService.js';
import { createUploadController } from '../controllers/upload.controller.js';
import { createAnalysisController } from '../controllers/analysis.controller.js';

export function createRoutes(analysisService: AnalysisService): Router {
  const router = Router();
  const uploadCtrl = createUploadController(analysisService);
  const analysisCtrl = createAnalysisController(analysisService);

  // Health check
  router.get('/health', (_req, res) => {
    res.json({ success: true, data: { status: 'ok', uptime: process.uptime() }, meta: { timestamp: new Date().toISOString() } });
  });

  // Upload
  router.post('/upload', uploadRateLimiter, uploadMiddleware.single('file'), uploadCtrl.uploadPdf);
  router.post('/ingest/xbrl', uploadRateLimiter, uploadCtrl.ingestXbrl);

  // Analysis CRUD & Stream
  router.get('/analysis/:id/stream', uploadCtrl.streamProgress);
  router.get('/analyses', analysisCtrl.list);
  router.get('/analysis/:id', analysisCtrl.getById);
  router.get('/analysis/:id/scores', analysisCtrl.getScores);
  router.get('/analysis/:id/recommendations', analysisCtrl.getRecommendations);
  router.delete('/analysis/:id', analysisCtrl.delete);

  return router;
}
