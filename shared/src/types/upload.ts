// ─── Upload Types ───────────────────────────────────────────────────────────
export interface UploadResponse {
  analysisId: string;
  fileName: string;
  fileSizeBytes: number;
  status: 'UPLOADING';
  message: string;
}
