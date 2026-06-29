// ─── Analysis Controller ────────────────────────────────────────────────────
import type { Request, Response } from 'express';
import type { AnalysisService } from '../services/analysis/AnalysisService.js';
import { NotFoundError } from '../utils/errors.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function getParamId(req: Request): string {
  const id = req.params['id'];
  if (!id || typeof id !== 'string') throw new NotFoundError('Analysis');
  return id;
}

export function createAnalysisController(analysisService: AnalysisService) {
  return {
    getById: asyncHandler(async (req: Request, res: Response) => {
      const id = getParamId(req);
      const analysis = await analysisService.getAnalysis(id);
      if (!analysis) throw new NotFoundError('Analysis', id);
      res.json({ success: true, data: analysis, meta: { timestamp: new Date().toISOString() } });
    }),

    getScores: asyncHandler(async (req: Request, res: Response) => {
      const id = getParamId(req);
      const analysis = await analysisService.getAnalysis(id);
      if (!analysis) throw new NotFoundError('Analysis', id);
      res.json({ success: true, data: analysis.scoring, meta: { timestamp: new Date().toISOString() } });
    }),

    getRecommendations: asyncHandler(async (req: Request, res: Response) => {
      const id = getParamId(req);
      const analysis = await analysisService.getAnalysis(id);
      if (!analysis) throw new NotFoundError('Analysis', id);
      res.json({ success: true, data: analysis.recommendations, meta: { timestamp: new Date().toISOString() } });
    }),

    list: asyncHandler(async (req: Request, res: Response) => {
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 10;
      const result = await analysisService.listAnalyses(page, limit);
      res.json({ success: true, data: { ...result, page, limit, totalPages: Math.ceil(result.total / limit) }, meta: { timestamp: new Date().toISOString() } });
    }),

    delete: asyncHandler(async (req: Request, res: Response) => {
      const id = getParamId(req);
      const deleted = await analysisService.deleteAnalysis(id);
      if (!deleted) throw new NotFoundError('Analysis', id);
      res.json({ success: true, data: { deleted: true }, meta: { timestamp: new Date().toISOString() } });
    }),
  };
}
