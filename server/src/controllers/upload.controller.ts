import type { Request, Response } from 'express';
import type { AnalysisService } from '../services/analysis/AnalysisService.js';
import { PdfIngestionSource } from '../services/ingestion/PdfIngestionSource.js';
import { XbrlIngestionSource } from '../services/ingestion/XbrlIngestionSource.js';
import { analysisEventEmitter } from '../services/analysis/AnalysisService.js';
import { FileUploadError } from '../utils/errors.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export function createUploadController(analysisService: AnalysisService) {
  return {
    uploadPdf: asyncHandler(async (req: Request, res: Response) => {
      if (!req.file) throw new FileUploadError('No file uploaded. Please upload a PDF file.');

      const source = new PdfIngestionSource();
      const analysisId = await analysisService.createAnalysis(
        source,
        req.file.path,
        req.file.originalname,
        req.file.size,
      );

      res.status(202).json({
        success: true,
        data: { analysisId, fileName: req.file.originalname, fileSizeBytes: req.file.size, status: 'UPLOADING', message: 'PDF uploaded. Processing has begun.' },
        meta: { timestamp: new Date().toISOString() },
      });
    }),

    ingestXbrl: asyncHandler(async (req: Request, res: Response) => {
      const { url } = req.body;
      if (!url || typeof url !== 'string') {
        res.status(400).json({ success: false, error: 'Valid XBRL URL is required' });
        return;
      }

      const source = new XbrlIngestionSource();
      const analysisId = await analysisService.createAnalysis(
        source,
        url,
        url.split('/').pop() || 'xbrl_report.xml',
        0, // size unknown until download
      );

      res.status(202).json({
        success: true,
        data: { analysisId, fileName: url, fileSizeBytes: 0, status: 'UPLOADING', message: 'XBRL link received. Processing has begun.' },
        meta: { timestamp: new Date().toISOString() },
      });
    }),

    streamProgress: asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params;
      
      // Setup SSE Headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      // Listen for events for this specific analysis ID
      const eventName = `progress:${id}`;
      const listener = (progress: any) => {
        res.write(`data: ${JSON.stringify(progress)}\n\n`);
        if (progress.step === 'COMPLETED' || progress.step === 'FAILED') {
          res.end();
          analysisEventEmitter.removeListener(eventName, listener);
        }
      };

      analysisEventEmitter.on(eventName, listener);

      // Clean up if client closes connection early
      req.on('close', () => {
        analysisEventEmitter.removeListener(eventName, listener);
        res.end();
      });
    }),
  };
}
