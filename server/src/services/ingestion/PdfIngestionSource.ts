import type { BrsrReport } from '@brsr-srmm/shared';
import type { IngestionSource, ProgressCallback } from './IngestionSource.js';
import { PdfParserService } from '../pdf/PdfParserService.js';
import { ExtractionService } from '../extraction/ExtractionService.js';

export class PdfIngestionSource implements IngestionSource {
  readonly sourceId = 'PDF_UPLOAD';

  private parser = new PdfParserService();
  private extractor = new ExtractionService();

  async process(filePath: string, onProgress?: ProgressCallback): Promise<BrsrReport> {
    try {
      // 1. VALIDATING
      onProgress?.({ step: 'VALIDATING', progressPercentage: 10, message: 'Validating uploaded PDF file...' });
      
      // 2. PARSING
      onProgress?.({ step: 'PARSING', progressPercentage: 30, message: 'Parsing PDF text and structures...' });
      const parsedData = await this.parser.parse(filePath);

      // 3. EXTRACTING
      onProgress?.({ step: 'EXTRACTING', progressPercentage: 60, message: 'Extracting BRSR sections via NLP heuristics...' });
      const report = this.extractor.extract(parsedData);

      // 4. NORMALIZING
      onProgress?.({ step: 'NORMALIZING', progressPercentage: 90, message: 'Normalizing PDF text into unified schema...' });
      // The ExtractionService already returns a unified BrsrReport format.
      // So no additional mapping is needed for the legacy pipeline.

      // 5. COMPLETED
      onProgress?.({ step: 'COMPLETED', progressPercentage: 100, message: 'PDF extraction complete.' });
      
      return report;
    } catch (err) {
      onProgress?.({ step: 'FAILED', progressPercentage: 100, message: (err as Error).message });
      throw err;
    }
  }
}
