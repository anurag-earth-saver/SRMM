import type { BrsrReport } from '@brsr-srmm/shared';
import type { IngestionSource, ProgressCallback } from './IngestionSource.js';
import { XbrlDownloader } from './xbrl/download.js';
import { XbrlParser } from './xbrl/parser.js';
import { XbrlMapper } from './xbrl/mapper.js';
import { XbrlNormalizer } from './xbrl/normalizer.js';
import { XbrlCache } from './xbrl/cache.js';

export class XbrlIngestionSource implements IngestionSource {
  readonly sourceId = 'XBRL_URL';

  private downloader = new XbrlDownloader();
  private parser = new XbrlParser();
  private mapper = new XbrlMapper();
  private normalizer = new XbrlNormalizer();
  private cache = new XbrlCache();

  async process(url: string, onProgress?: ProgressCallback): Promise<BrsrReport> {
    try {
      // 1. VALIDATING
      onProgress?.({ step: 'VALIDATING', progressPercentage: 10, message: 'Validating XBRL URL...' });
      // Implicitly validated by Downloader
      
      // 2. DOWNLOADING
      onProgress?.({ step: 'DOWNLOADING', progressPercentage: 30, message: 'Downloading XBRL instance document...' });
      let xmlData = this.cache.get(url);
      if (!xmlData) {
        xmlData = await this.downloader.download(url);
        this.cache.set(url, xmlData);
      } else {
        onProgress?.({ step: 'DOWNLOADING', progressPercentage: 30, message: 'Using cached XBRL document.' });
      }

      // 3. PARSING
      onProgress?.({ step: 'PARSING', progressPercentage: 50, message: 'Parsing XML structures...' });
      const facts = this.parser.parse(xmlData);

      // 4. MAPPING
      onProgress?.({ step: 'MAPPING', progressPercentage: 70, message: 'Mapping facts against BRSR taxonomy...' });
      const mappedData = this.mapper.map(facts);

      // 5. NORMALIZING
      onProgress?.({ step: 'NORMALIZING', progressPercentage: 90, message: 'Normalizing into unified schema...' });
      const unifiedReport = this.normalizer.normalize(mappedData);

      // 6. COMPLETED
      onProgress?.({ step: 'COMPLETED', progressPercentage: 100, message: 'XBRL ingestion complete.' });
      
      return unifiedReport;
    } catch (err) {
      onProgress?.({ step: 'FAILED', progressPercentage: 100, message: (err as Error).message });
      throw err;
    }
  }
}
