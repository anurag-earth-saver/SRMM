import type { BrsrReport } from '@brsr-srmm/shared';

export type IngestionStep =
  | 'VALIDATING'
  | 'DOWNLOADING'
  | 'PARSING'
  | 'EXTRACTING'
  | 'MAPPING'
  | 'NORMALIZING'
  | 'COMPLETED'
  | 'FAILED';

export interface IngestionProgress {
  step: IngestionStep;
  progressPercentage: number;
  message: string;
}

export type ProgressCallback = (progress: IngestionProgress) => void;

export interface IngestionSource {
  /**
   * Identifies the type of ingestion source (e.g. 'PDF', 'XBRL_URL')
   */
  readonly sourceId: string;

  /**
   * Processes the input payload and returns the unified BRSR Report.
   * Emits progress updates via the optional callback.
   *
   * @param payload For PDF, this is the filePath. For XBRL, this is the URL.
   * @param onProgress Callback to report step-by-step progress
   */
  process(payload: string, onProgress?: ProgressCallback): Promise<BrsrReport>;
}
