// ─── Analysis API Service ───────────────────────────────────────────────────
import { api } from './api';
import type { AnalysisResult, UploadResponse, Recommendation } from '@brsr-srmm/shared';

export const analysisApi = {
  upload: (file: File, onProgress?: (p: number) => void) =>
    api.uploadFile('/upload', file, onProgress) as Promise<UploadResponse>,

  ingestXbrl: (url: string) => 
    api.post<UploadResponse>('/ingest/xbrl', { url }),

  getAnalysis: (id: string) => api.get<AnalysisResult>(`/analysis/${id}`),

  getRecommendations: (id: string) => api.get<Recommendation[]>(`/analysis/${id}/recommendations`),

  deleteAnalysis: (id: string) => api.delete<{ deleted: boolean }>(`/analysis/${id}`),
};
