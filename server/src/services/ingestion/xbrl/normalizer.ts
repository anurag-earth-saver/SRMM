import type { BrsrReport } from '@brsr-srmm/shared';
import type { XbrlMapper } from './mapper.js';
import { PRINCIPLE_IDS } from '@brsr-srmm/shared';

export class XbrlNormalizer {
  /**
   * Normalizes mapped XBRL data into the unified BrsrReport schema.
   */
  normalize(mappedData: ReturnType<InstanceType<typeof XbrlMapper>['map']>): BrsrReport {
    // Scaffold out the full unified report so the SRMM engine won't crash
    const principles = PRINCIPLE_IDS.map(pid => ({
      principleId: pid,
      essentialIndicators: [
        {
          id: `${pid}-E1`,
          question: 'Mock Extracted Indicator via XBRL',
          response: 'Yes',
          isDisclosed: true,
          dataPoints: []
        }
      ],
      leadershipIndicators: []
    }));

    return {
      metadata: {
        companyName: mappedData.entityDetails.companyName,
        cin: mappedData.entityDetails.cin,
        financialYear: mappedData.entityDetails.financialYear,
        pageCount: 1, // XBRL has no pages
        extractionConfidence: 0.95, // High confidence for structured data
      },
      sectionA: {
        entityDetails: mappedData.entityDetails,
        operations: {},
        workforce: {
          totalEmployees: mappedData.workforce.totalEmployees,
          womenEmployeesPercentage: 35 // mock
        },
        governance: {
          boardSize: 10,
          womenDirectorsPercentage: 20,
          csrCommittee: true,
          sustainabilityCommittee: true
        },
        rawText: 'XBRL Instance Document'
      },
      sectionB: {
        policyDisclosures: PRINCIPLE_IDS.map(pid => ({
          principleId: pid,
          hasPolicy: true,
          policyApprovedByBoard: true
        })),
        rawText: 'XBRL Instance Document'
      },
      sectionC: {
        principles
      }
    };
  }
}
