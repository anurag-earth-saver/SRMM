// ─── Section A Extractor ────────────────────────────────────────────────────
// Extracts entity details, operations, workforce, and governance from Section A text.
import type { SectionAData } from '@brsr-srmm/shared';
import rules from '../../config/extraction_rules.json' with { type: 'json' };

function extractField(text: string, patterns: string[]): string | undefined {
  for (const pattern of patterns) {
    const match = text.match(new RegExp(pattern, 'i'));
    if (match?.[1]?.trim()) return match[1].trim();
  }
  return undefined;
}

function extractNumber(text: string, patterns: string[]): number | undefined {
  const val = extractField(text, patterns);
  if (!val) return undefined;
  const num = parseFloat(val.replace(/,/g, ''));
  return isNaN(num) ? undefined : num;
}

export function extractSectionA(text: string): SectionAData {
  const r = rules.sectionA;
  
  const entityDetails: Record<string, string | undefined> = {
    companyName: extractField(text, r.entityDetails.companyName),
    cin: extractField(text, r.entityDetails.cin),
    registeredAddress: extractField(text, r.entityDetails.registeredAddress),
    email: extractField(text, r.entityDetails.email),
    website: extractField(text, r.entityDetails.website),
    yearOfIncorporation: extractField(text, r.entityDetails.yearOfIncorporation),
  };

  // Derive company name from CIN line or first few lines if not found
  if (!entityDetails['companyName']) {
    const firstLines = text.split('\n').slice(0, 20).join(' ');
    const nameMatch = firstLines.match(/(?:^|\n)\s*([A-Z][A-Za-z\s&.]+(?:Limited|Ltd|Corporation|Corp))/);
    if (nameMatch) entityDetails['companyName'] = nameMatch[1]?.trim();
  }

  const operations: Record<string, unknown> = {
    mainBusinessActivity: extractField(text, r.operations.mainBusinessActivity),
    productsServices: extractProductsServices(text),
    numberOfLocations: {
      plants: extractNumber(text, r.operations.numberOfLocations.plants),
      offices: extractNumber(text, r.operations.numberOfLocations.offices),
    },
    marketsServed: extractMarketsServed(text),
  };

  const workforce: Record<string, number | undefined> = {
    totalEmployees: extractNumber(text, r.workforce.totalEmployees),
    totalWorkers: extractNumber(text, r.workforce.totalWorkers),
    womenEmployeesPercentage: extractNumber(text, r.workforce.womenEmployeesPercentage),
    differentlyAbledPercentage: extractNumber(text, r.workforce.differentlyAbledPercentage),
    turnoverRate: extractNumber(text, r.workforce.turnoverRate),
  };

  const governance: Record<string, unknown> = {
    boardSize: extractNumber(text, r.governance.boardSize),
    womenDirectorsPercentage: extractNumber(text, r.governance.womenDirectorsPercentage),
    independentDirectorsPercentage: extractNumber(text, r.governance.independentDirectorsPercentage),
    csrCommittee: new RegExp(r.governance.csrCommittee[0], 'i').test(text),
    sustainabilityCommittee: new RegExp(r.governance.sustainabilityCommittee[0], 'i').test(text),
  };

  return { entityDetails, operations, workforce, governance, rawText: text };
}

function extractProductsServices(text: string): string[] {
  const match = text.match(/products?\s*(?:\/|and)\s*services?[^:]*:[\s]*([^\n]+(?:\n[^\n]+){0,3})/i);
  if (!match?.[1]) return [];
  return match[1]
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2 && s.length < 200);
}

function extractMarketsServed(text: string): string[] {
  const match = text.match(/markets?\s*served[^:]*:[\s]*([^\n]+)/i);
  if (!match?.[1]) return [];
  return match[1]
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1);
}
