// ─── Analysis Service ───────────────────────────────────────────────────────
import { v4 as uuidv4 } from 'uuid';
import type { AnalysisResult, AnalysisSummary } from '@brsr-srmm/shared';
import { PdfParserService } from '../pdf/PdfParserService.js';
import { ExtractionService } from '../extraction/ExtractionService.js';
import { ScoringEngine } from '../scoring/ScoringEngine.js';
import { RecommendationEngine } from '../recommendations/RecommendationEngine.js';
import { logger } from '../../utils/logger.js';
import type { IngestionSource, IngestionProgress } from '../ingestion/IngestionSource.js';
import { EventEmitter } from 'node:events';

import fs from 'node:fs/promises';

// In-memory store — swap for a real DB repository when needed
const store = new Map<string, AnalysisResult>();
// Event emitter for Server-Sent Events (SSE) progress streams
export const analysisEventEmitter = new EventEmitter();

export class AnalysisService {
  private scorer = new ScoringEngine();
  private recommender = new RecommendationEngine();

  async createAnalysis(source: IngestionSource, payload: string, fileName: string, fileSizeBytes: number): Promise<string> {
    const id = uuidv4();
    const analysis: AnalysisResult = {
      id,
      status: 'UPLOADING',
      companyName: 'Processing...',
      financialYear: 'Unknown',
      uploadedAt: new Date().toISOString(),
      fileName,
      fileSizeBytes,
      report: null,
      scoring: null,
      recommendations: [],
    };
    store.set(id, analysis);
    logger.info(`Analysis created: ${id}`);

    // Process in background (non-blocking)
    this.processAnalysis(id, source, payload).catch((err) =>
      logger.error(`Analysis failed: ${id}`, { error: String(err) }),
    );
    return id;
  }

  async getAnalysis(id: string): Promise<AnalysisResult | null> {
    return store.get(id) ?? null;
  }

  async listAnalyses(page: number, limit: number): Promise<{ items: AnalysisSummary[]; total: number }> {
    const all = Array.from(store.values());
    const start = (page - 1) * limit;
    const items: AnalysisSummary[] = all.slice(start, start + limit).map((a) => ({
      id: a.id,
      status: a.status,
      companyName: a.companyName,
      financialYear: a.financialYear,
      uploadedAt: a.uploadedAt,
      completedAt: a.completedAt,
      totalScore: a.scoring?.totalScore,
      maturityLevel: a.scoring?.maturityLevel,
      fileName: a.fileName,
    }));
    return { items, total: all.length };
  }

  async deleteAnalysis(id: string): Promise<boolean> {
    return store.delete(id);
  }

  private async processAnalysis(id: string, source: IngestionSource, payload: string): Promise<void> {
    try {
      const analysis = store.get(id)!;

      // Wrap the progress callback to update the store and emit SSE
      const onProgress = (progress: IngestionProgress) => {
        analysis.status = progress.step as any;
        analysisEventEmitter.emit(`progress:${id}`, progress);
      };

      // Step 1: Execute Ingestion Strategy (PDF or XBRL)
      const report = await source.process(payload, onProgress);
      
      analysis.report = report;
      analysis.companyName = report.metadata.companyName;
      analysis.financialYear = report.metadata.financialYear;

      // Step 2: Score
      onProgress({ step: 'SCORING' as any, progressPercentage: 80, message: 'Calculating SRMM scores...' });
      const scoring = this.scorer.score(report);
      analysis.scoring = scoring;

      // Step 3: Recommend
      const recommendations = this.recommender.generate(scoring, report);
      analysis.recommendations = recommendations;

      // Step 4: Complete
      onProgress({ step: 'COMPLETED', progressPercentage: 100, message: 'Analysis complete.' });
      analysis.completedAt = new Date().toISOString();
      logger.info(`Analysis completed: ${id}`);
    } catch (err) {
      const analysis = store.get(id);
      if (analysis) {
        analysis.status = 'FAILED';
        analysis.errorMessage = err instanceof Error ? err.message : 'Unknown error';
        analysisEventEmitter.emit(`progress:${id}`, { step: 'FAILED', progressPercentage: 100, message: analysis.errorMessage });
      }
    } finally {
      // Clean up payload if it's a temporary local file (PDF upload)
      if (source.sourceId === 'PDF_UPLOAD') {
        try {
          await fs.unlink(payload);
          logger.info(`Cleaned up temp file: ${payload}`);
        } catch (err) {
          logger.warn(`Failed to clean up temp file: ${payload}`, { error: String(err) });
        }
      }
    }
  }
}
