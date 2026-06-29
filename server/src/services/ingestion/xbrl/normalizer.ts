import type { BrsrReport, Indicator, PrincipleId } from '@brsr-srmm/shared';
import { PRINCIPLE_IDS } from '@brsr-srmm/shared';
import type { MappedXbrlData } from './mapper.js';
import extractionRules from '../../../config/extraction_rules.json' with { type: 'json' };

interface IndicatorDef {
  id: string;
  question: string;
  patterns: string[];
}

export class XbrlNormalizer {
  normalize(mappedData: MappedXbrlData): BrsrReport {
    const principles = PRINCIPLE_IDS.map((pid) => ({
      principleId: pid,
      essentialIndicators: this.buildIndicators(pid, 'essential', mappedData),
      leadershipIndicators: this.buildIndicators(pid, 'leadership', mappedData),
    }));

    return {
      metadata: {
        companyName: mappedData.entityDetails.companyName ?? 'Unknown Company',
        cin: mappedData.entityDetails.cin ?? '',
        financialYear: mappedData.financialYear,
        pageCount: 1,
        extractionConfidence: mappedData.extractionConfidence,
      },
      sectionA: {
        entityDetails: mappedData.entityDetails,
        operations: mappedData.operations,
        workforce: mappedData.workforce,
        governance: mappedData.governance,
        rawText: 'XBRL Instance Document (SEBI in-capmkt taxonomy)',
      },
      sectionB: {
        policyDisclosures: mappedData.policyDisclosures.map((pd) => ({
          principleId: `P${pd.principleNum}` as PrincipleId,
          hasPolicy: pd.hasPolicy,
          policyApprovedByBoard: pd.policyApprovedByBoard,
          policyPubliclyAvailable: pd.policyPubliclyAvailable,
          hasGrievanceMechanism: pd.hasGrievanceMechanism,
        })),
        rawText: 'XBRL Instance Document (SEBI in-capmkt taxonomy)',
      },
      sectionC: { principles },
    };
  }

  private buildIndicators(
    pid: PrincipleId,
    type: 'essential' | 'leadership',
    mappedData: MappedXbrlData,
  ): Indicator[] {
    const defs = (extractionRules.sectionC as Record<string, { essential: IndicatorDef[]; leadership: IndicatorDef[] }>)[pid];
    if (!defs) return [];

    return defs[type].map((def) => {
      const mapped = mappedData.indicators[def.id];
      const isDisclosed = mapped?.disclosed ?? false;
      return {
        id: def.id,
        question: def.question,
        response: mapped?.response ?? (isDisclosed ? 'Disclosed' : null),
        dataPoints: mapped?.dataPoints ?? [],
        isDisclosed,
      };
    });
  }
}
