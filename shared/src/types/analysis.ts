// ─── Analysis Types ─────────────────────────────────────────────────────────
import type { BrsrReport } from './report';
import type { ScoringResult } from './scoring';
import type { Recommendation } from './recommendation';

export type AnalysisStatus = 'UPLOADING' | 'EXTRACTING' | 'SCORING' | 'COMPLETED' | 'FAILED';

export interface AnalysisResult {
  id: string;
  status: AnalysisStatus;
  companyName: string;
  financialYear: string;
  industry?: string;
  uploadedAt: string;
  completedAt?: string;
  fileName: string;
  fileSizeBytes: number;
  report: BrsrReport | null;
  scoring: ScoringResult | null;
  recommendations: Recommendation[];
  errorMessage?: string;
}

export interface AnalysisSummary {
  id: string;
  status: AnalysisStatus;
  companyName: string;
  financialYear: string;
  uploadedAt: string;
  completedAt?: string;
  totalScore?: number;
  maturityLevel?: number;
  fileName: string;
}
