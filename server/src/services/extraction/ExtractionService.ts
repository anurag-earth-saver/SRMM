// ─── BRSR Extraction Service (real implementation) ──────────────────────────
import type { BrsrReport } from '@brsr-srmm/shared';
import type { ParsedPdf } from '../pdf/PdfParserService.js';
import { splitIntoSections } from './TextNormalizer.js';
import { extractSectionA } from './SectionAExtractor.js';
import { extractSectionB } from './SectionBExtractor.js';
import { extractSectionC } from './SectionCExtractor.js';
import { logger } from '../../utils/logger.js';

export class ExtractionService {
  extract(parsed: ParsedPdf): BrsrReport {
    logger.info('Starting BRSR extraction...');

    const sections = splitIntoSections(parsed.text);
    logger.info(`Section lengths — A: ${sections.sectionA.length}, B: ${sections.sectionB.length}, C: ${sections.sectionC.length}`);

    const sectionA = extractSectionA(sections.sectionA || sections.fullText);
    const sectionB = extractSectionB(sections.sectionB || sections.fullText);
    const sectionC = extractSectionC(sections.sectionC || sections.fullText);

    // Derive company name from Section A or metadata
    const companyName =
      sectionA.entityDetails['companyName'] ??
      parsed.metadata['title'] ??
      'Unknown Company';

    // Derive financial year
    const fyMatch = (sections.fullText).match(/(?:FY|financial\s*year)[:\s]*(\d{4}[-–]\d{2,4})/i);
    const financialYear = fyMatch?.[1] ?? sectionA.entityDetails['financialYear'] ?? 'Unknown';

    // Calculate extraction confidence based on how much data was found
    const totalIndicators = sectionC.principles.reduce(
      (sum, p) => sum + p.essentialIndicators.length + p.leadershipIndicators.length,
      0,
    );
    const disclosedIndicators = sectionC.principles.reduce(
      (sum, p) =>
        sum +
        p.essentialIndicators.filter((i) => i.isDisclosed).length +
        p.leadershipIndicators.filter((i) => i.isDisclosed).length,
      0,
    );
    const hasSections = (sections.sectionA.length > 100 ? 0.2 : 0) +
      (sections.sectionB.length > 100 ? 0.2 : 0) +
      (sections.sectionC.length > 100 ? 0.2 : 0);
    const indicatorConfidence = totalIndicators > 0 ? (disclosedIndicators / totalIndicators) * 0.4 : 0;
    const extractionConfidence = Math.min(hasSections + indicatorConfidence, 1);

    const report: BrsrReport = {
      metadata: {
        companyName,
        cin: sectionA.entityDetails['cin'] ?? '',
        financialYear,
        pageCount: parsed.pages,
        extractionConfidence,
      },
      sectionA,
      sectionB,
      sectionC,
    };

    logger.info(`Extraction complete — Company: ${companyName}, FY: ${financialYear}, Confidence: ${Math.round(extractionConfidence * 100)}%`);
    return report;
  }
}
