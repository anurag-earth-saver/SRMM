import type { XbrlFact } from './parser.js';
import { FactIndex, parseBoolean, parseNumber, toPercentage } from './FactIndex.js';
import taxonomy from '../../../config/xbrl_taxonomy.json' with { type: 'json' };

export interface MappedXbrlData {
  entityDetails: Record<string, string | undefined>;
  operations: Record<string, unknown>;
  workforce: Record<string, number | undefined>;
  governance: Record<string, unknown>;
  policyDisclosures: Array<{
    principleNum: number;
    hasPolicy: boolean;
    policyApprovedByBoard: boolean;
    policyPubliclyAvailable: boolean;
    hasGrievanceMechanism: boolean;
  }>;
  indicators: Record<string, { disclosed: boolean; response: string | null; dataPoints: Array<{ label: string; value: string; unit?: string }> }>;
  financialYear: string;
  extractionConfidence: number;
}

export class XbrlMapper {
  map(facts: XbrlFact[]): MappedXbrlData {
    const index = new FactIndex(facts);
    const tax = taxonomy as typeof taxonomy;

    const entityDetails = this.mapEntityDetails(index, tax);
    const operations = this.mapOperations(index, tax);
    const workforce = this.mapWorkforce(index, tax);
    const governance = this.mapGovernance(index, tax);
    const policyDisclosures = this.mapPolicyDisclosures(index, tax);
    const indicators = this.mapIndicators(index, tax);

    const disclosedCount = Object.values(indicators).filter((i) => i.disclosed).length;
    const totalIndicators = Object.keys(indicators).length;
    const sectionAFields = Object.values(entityDetails).filter(Boolean).length;
    const extractionConfidence = Math.min(
      0.3 +
        (sectionAFields / 6) * 0.2 +
        (totalIndicators > 0 ? (disclosedCount / totalIndicators) * 0.5 : 0),
      1,
    );

    return {
      entityDetails,
      operations,
      workforce,
      governance,
      policyDisclosures,
      indicators,
      financialYear: this.resolveFinancialYear(index),
      extractionConfidence,
    };
  }

  private mapEntityDetails(index: FactIndex, tax: typeof taxonomy): Record<string, string | undefined> {
    const result: Record<string, string | undefined> = {};
    for (const [field, elements] of Object.entries(tax.sectionA.entityDetails)) {
      result[field] = index.resolveValue(elements, tax.primaryContext);
    }
    if (!result['cin']) {
      result['cin'] = index.resolveValue(['CorporateIdentityNumber'], tax.primaryContext);
    }
    if (result['yearOfIncorporation']) {
      result['yearOfIncorporation'] = result['yearOfIncorporation'].slice(0, 4);
    }
    return result;
  }

  private mapOperations(index: FactIndex, tax: typeof taxonomy): Record<string, unknown> {
    const mainActivity = index.resolveValue(tax.sectionA.operations.mainBusinessActivity, tax.primaryContext);
    const locations = parseNumber(index.resolveValue(tax.sectionA.operations.numberOfLocations, tax.primaryContext));
    const states = parseNumber(index.resolveValue(['NumberOfStatesWhereMarketServedByTheEntity'], ['DCYMain']));
    const countries = parseNumber(index.resolveValue(['NumberOfCountriesWhereMarketServedByTheEntity'], ['DCYMain']));

    const markets: string[] = [];
    if (states !== undefined) markets.push(`${states} states`);
    if (countries !== undefined) markets.push(`${countries} countries`);

    return {
      mainBusinessActivity: mainActivity,
      productsServices: this.collectProductsServices(index),
      numberOfLocations: locations !== undefined ? { total: locations } : undefined,
      marketsServed: markets.length > 0 ? markets : undefined,
    };
  }

  private collectProductsServices(index: FactIndex): string[] {
    const products: string[] = [];
    for (const fact of index.getAll('DescriptionOfProductOrService')) {
      if (fact.value) products.push(fact.value);
    }
    for (const fact of index.getAll('NICCodeOfProductOrServiceSoldByTheEntity')) {
      if (fact.value) products.push(`NIC: ${fact.value}`);
    }
    return products.slice(0, 10);
  }

  private mapWorkforce(index: FactIndex, tax: typeof taxonomy): Record<string, number | undefined> {
    const ctxMap = tax.sectionA.workforceContexts as Record<string, string>;
    const result: Record<string, number | undefined> = {};

    for (const [field, elements] of Object.entries(tax.sectionA.workforce)) {
      const ctx = ctxMap[field];
      const raw = ctx
        ? index.resolveValue(elements, [ctx])
        : index.resolveValue(elements, tax.primaryContext);

      if (field.includes('Percentage') || field === 'turnoverRate') {
        result[field] = toPercentage(raw);
      } else {
        result[field] = parseNumber(raw);
      }
    }

    return result;
  }

  private mapGovernance(index: FactIndex, tax: typeof taxonomy): Record<string, unknown> {
    const ctx = tax.sectionA.governanceContexts;
    return {
      boardSize: parseNumber(index.resolveValue(tax.sectionA.governance.boardSize, ctx)),
      womenDirectorsPercentage: toPercentage(
        index.resolveValue(tax.sectionA.governance.womenDirectorsPercentage, ctx),
      ),
      independentDirectorsPercentage: toPercentage(
        index.resolveValue(tax.sectionA.governance.independentDirectorsPercentage, ctx),
      ),
      csrCommittee: parseBoolean(index.resolveValue(tax.sectionA.governance.csrCommittee, ctx)),
      sustainabilityCommittee: parseBoolean(
        index.resolveValue(tax.sectionA.governance.sustainabilityCommittee, ctx),
      ),
    };
  }

  private mapPolicyDisclosures(index: FactIndex, tax: typeof taxonomy) {
    const disclosures = [];
    for (let n = 1; n <= 9; n++) {
      const ctx = `${tax.sectionB.principleContextPrefix}${n}`;
      const hasPolicy = tax.sectionB.hasPolicy.some((el) => parseBoolean(index.getValue(el, ctx)));
      const boardApproval = tax.sectionB.boardApproval.some((el) => parseBoolean(index.getValue(el, ctx)));
      const publicLink = tax.sectionB.publicAvailability.some((el) => index.hasTruthyValue(el, ctx));
      const grievance =
        tax.sectionB.grievanceMechanism.some((el) => index.hasTruthyValue(el, ctx)) ||
        tax.sectionB.grievanceMechanism.some((el) => index.hasTruthyValue(el));

      disclosures.push({
        principleNum: n,
        hasPolicy,
        policyApprovedByBoard: boardApproval,
        policyPubliclyAvailable: publicLink,
        hasGrievanceMechanism: grievance,
      });
    }
    return disclosures;
  }

  private mapIndicators(index: FactIndex, tax: typeof taxonomy) {
    const indicators: MappedXbrlData['indicators'] = {};
    const sectionC = tax.sectionC as Record<string, string[]>;

    for (const [indicatorId, elements] of Object.entries(sectionC)) {
      const disclosed = index.isDisclosed(elements);
      const response = disclosed ? this.buildResponse(index, elements) : null;
      const dataPoints = disclosed ? index.collectDataPoints(elements, indicatorId) : [];
      indicators[indicatorId] = { disclosed, response, dataPoints };
    }

    return indicators;
  }

  private buildResponse(index: FactIndex, elements: string[]): string {
    const parts: string[] = [];
    for (const element of elements) {
      const fact = index.getFirst(element);
      if (fact && fact.value.length > 10) {
        parts.push(fact.value.slice(0, 500));
        break;
      }
    }
    if (parts.length === 0) {
      for (const element of elements) {
        const val = index.getFirst(element)?.value;
        if (val) {
          parts.push(val);
          break;
        }
      }
    }
    return parts.join('; ') || 'Disclosed';
  }

  private resolveFinancialYear(index: FactIndex): string {
    const start = index.getValue('DateOfStartOfFinancialYear', 'DCYMain');
    const end = index.getValue('DateOfEndOfFinancialYear', 'DCYMain');
    if (start && end) {
      const startYear = start.slice(0, 4);
      const endYear = end.slice(2, 4);
      return `${startYear}-${endYear}`;
    }
    const reporting = index.resolveValue(['ReportingPeriod', 'FinancialYear'], taxonomy.primaryContext);
    return reporting ?? 'Unknown';
  }
}
