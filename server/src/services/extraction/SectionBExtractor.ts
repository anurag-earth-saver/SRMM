// ─── Section B Extractor ────────────────────────────────────────────────────
// Extracts policy disclosures for all 9 NGRBC principles from Section B text.
import type { SectionBData, PolicyDisclosure, PrincipleId } from '@brsr-srmm/shared';
import { PRINCIPLE_IDS } from '@brsr-srmm/shared';
import rules from '../../config/extraction_rules.json' with { type: 'json' };

export function extractSectionB(text: string): SectionBData {
  const policyDisclosures: PolicyDisclosure[] = PRINCIPLE_IDS.map((pid) => {
    const principleBlock = extractPrincipleBlock(text, pid);
    return {
      principleId: pid,
      hasPolicy: detectPolicy(principleBlock, pid),
      policyApprovedByBoard: detectBoardApproval(principleBlock),
      policyPubliclyAvailable: detectPublicAvailability(principleBlock),
      hasGrievanceMechanism: detectGrievanceMechanism(principleBlock),
    };
  });

  return { policyDisclosures, rawText: text };
}

function extractPrincipleBlock(text: string, principleId: PrincipleId): string {
  const num = principleId.replace('P', '');
  const nextNum = String(parseInt(num) + 1);

  // Try to find a block between "Principle X" and "Principle X+1"
  const pattern = new RegExp(
    `principle\\s*${num}[\\s\\S]*?(?=principle\\s*${nextNum}|$)`,
    'i',
  );
  const match = text.match(pattern);
  return match?.[0] ?? '';
}

function detectPolicy(block: string, _pid: PrincipleId): boolean {
  if (!block) return false;

  const r = rules.sectionB;

  for (const neg of r.negativePatterns) {
    if (new RegExp(neg, 'i').test(block)) return false;
  }

  for (const pos of r.positivePatterns) {
    if (new RegExp(pos, 'i').test(block)) return true;
  }

  return false;
}

function detectBoardApproval(block: string): boolean {
  return new RegExp(rules.sectionB.boardApprovalPatterns[0], 'i').test(block);
}

function detectPublicAvailability(block: string): boolean {
  return new RegExp(rules.sectionB.publicAvailabilityPatterns[0], 'i').test(block);
}

function detectGrievanceMechanism(block: string): boolean {
  return new RegExp(rules.sectionB.grievanceMechanismPatterns[0], 'i').test(block);
}
