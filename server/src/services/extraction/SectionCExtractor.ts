// ─── Section C Extractor ────────────────────────────────────────────────────
// Extracts principle-wise indicators and data points from Section C text.
import type { SectionCData, PrincipleData, Indicator, DataPoint, PrincipleId } from '@brsr-srmm/shared';
import { PRINCIPLE_IDS } from '@brsr-srmm/shared';

import rules from '../../config/extraction_rules.json' with { type: 'json' };

interface IndicatorDef {
  id: string;
  question: string;
  patterns: string[];
}

export function extractSectionC(text: string): SectionCData {
  const principles: PrincipleData[] = PRINCIPLE_IDS.map((pid) => {
    const principleBlock = extractPrincipleBlock(text, pid);
    const defs = (rules.sectionC as any)[pid];

    return {
      principleId: pid,
      essentialIndicators: defs.essential.map((def: IndicatorDef) => extractIndicator(principleBlock, def)),
      leadershipIndicators: defs.leadership.map((def: IndicatorDef) => extractIndicator(principleBlock, def)),
    };
  });

  return { principles };
}

function extractPrincipleBlock(text: string, principleId: PrincipleId): string {
  const num = parseInt(principleId.replace('P', ''));
  const nextNum = num + 1;

  const pattern = new RegExp(
    `principle\\s*${num}[\\s\\S]*?(?=principle\\s*${nextNum}\\b|$)`,
    'i',
  );
  const match = text.match(pattern);
  return match?.[0] ?? text; // Fall back to full text if principle not found
}

function extractIndicator(block: string, def: IndicatorDef): Indicator {
  const isDisclosed = def.patterns.some((p) => new RegExp(p, 'i').test(block));

  // Try to extract nearby data values if disclosed
  const dataPoints: DataPoint[] = [];
  if (isDisclosed) {
    for (const pattern of def.patterns) {
      const match = block.match(new RegExp(pattern, 'i'));
      if (match) {
        // Look for numbers near the match
        const context = block.slice(
          Math.max(0, (match.index ?? 0) - 20),
          (match.index ?? 0) + match[0].length + 200,
        );
        const numbers = context.match(/(\d[\d,.]*)\s*(%|tonnes?|kWh|GJ|KL|ML|Rs\.?|INR|lakhs?|crores?|nos?\.?|numbers?)?/gi);
        if (numbers) {
          for (const numStr of numbers.slice(0, 3)) {
            const parts = numStr.match(/([\d,.]+)\s*(.*)/);
            if (parts?.[1]) {
              dataPoints.push({
                label: def.question,
                value: parts[1],
                unit: parts[2]?.trim() || undefined,
              });
            }
          }
        }
        break;
      }
    }
  }

  return {
    id: def.id,
    question: def.question,
    response: isDisclosed ? 'Disclosed' : null,
    dataPoints,
    isDisclosed,
  };
}
