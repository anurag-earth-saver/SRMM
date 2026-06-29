// ─── Text Normalizer ────────────────────────────────────────────────────────
// Splits raw PDF text into BRSR sections and cleans up whitespace.

export interface SectionTexts {
  sectionA: string;
  sectionB: string;
  sectionC: string;
  fullText: string;
}

import rules from '../../config/extraction_rules.json' with { type: 'json' };

const SECTION_A_PATTERNS = rules.sectionPatterns.sectionA.map((p: string) => new RegExp(p, 'i'));
const SECTION_B_PATTERNS = rules.sectionPatterns.sectionB.map((p: string) => new RegExp(p, 'i'));
const SECTION_C_PATTERNS = rules.sectionPatterns.sectionC.map((p: string) => new RegExp(p, 'i'));

function findSectionStart(text: string, patterns: RegExp[]): number {
  for (const pattern of patterns) {
    const match = text.search(pattern);
    if (match !== -1) return match;
  }
  return -1;
}

export function splitIntoSections(rawText: string): SectionTexts {
  const text = rawText.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ');

  const aStart = findSectionStart(text, SECTION_A_PATTERNS);
  const bStart = findSectionStart(text, SECTION_B_PATTERNS);
  const cStart = findSectionStart(text, SECTION_C_PATTERNS);

  // Extract sections by boundary positions
  const sectionA = aStart >= 0
    ? text.slice(aStart, bStart >= 0 ? bStart : cStart >= 0 ? cStart : text.length)
    : '';

  const sectionB = bStart >= 0
    ? text.slice(bStart, cStart >= 0 ? cStart : text.length)
    : '';

  const sectionC = cStart >= 0 ? text.slice(cStart) : '';

  return { sectionA, sectionB, sectionC, fullText: text };
}
