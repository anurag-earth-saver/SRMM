// ─── Recommendation Engine (rule-based) ─────────────────────────────────────
import type {
  Recommendation,
  RecommendationPriority,
  RecommendationCategory,
  ScoringResult,
  BrsrReport,
  PrincipleId,
} from '@brsr-srmm/shared';
import { PRINCIPLES, PRINCIPLE_IDS } from '@brsr-srmm/shared';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../utils/logger.js';

interface RecommendationRule {
  check: (scoring: ScoringResult, report: BrsrReport) => RuleMatch | null;
}

interface RuleMatch {
  principleId: PrincipleId;
  section: 'A' | 'B' | 'C';
  category: RecommendationCategory;
  priority: RecommendationPriority;
  title: string;
  description: string;
  currentState: string;
  suggestedAction: string;
  impactScore: number;
}

import db from '../../config/srmm_database.json' with { type: 'json' };

function formatTemplate(template: string, data: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(data[key] ?? ''));
}

const recs = db.recommendations as any;

// ─── Rule Definitions ───────────────────────────────────────────────────────
const RULES: RecommendationRule[] = [
  // ── Section B: Missing policy rules ───────────────────────────────────────
  ...PRINCIPLE_IDS.map((pid): RecommendationRule => ({
    check: (_scoring, report) => {
      const pd = report.sectionB.policyDisclosures.find((p) => p.principleId === pid);
      if (!pd || pd.hasPolicy) return null;
      const p = PRINCIPLES[pid];
      const r = recs.sectionBMissingPolicy;
      return {
        principleId: pid,
        section: 'B',
        category: r.category,
        priority: r.priority,
        title: formatTemplate(r.titleTemplate, { shortName: p.shortName, pid, name: p.name }),
        description: formatTemplate(r.descriptionTemplate, { shortName: p.shortName, pid, name: p.name }),
        currentState: 'No policy disclosed',
        suggestedAction: formatTemplate(r.suggestedActionTemplate, { shortName: p.shortName, pid, name: p.name }),
        impactScore: r.impactScore,
      };
    },
  })),

  // ── Section B: Policy exists but not board-approved ───────────────────────
  ...PRINCIPLE_IDS.map((pid): RecommendationRule => ({
    check: (_scoring, report) => {
      const pd = report.sectionB.policyDisclosures.find((p) => p.principleId === pid);
      if (!pd || !pd.hasPolicy || pd.policyApprovedByBoard) return null;
      const p = PRINCIPLES[pid];
      const r = recs.sectionBNotApproved;
      return {
        principleId: pid,
        section: 'B',
        category: r.category,
        priority: r.priority,
        title: formatTemplate(r.titleTemplate, { shortName: p.shortName, pid, name: p.name }),
        description: formatTemplate(r.descriptionTemplate, { shortName: p.shortName, pid, name: p.name }),
        currentState: 'Policy not board-approved',
        suggestedAction: formatTemplate(r.suggestedActionTemplate, { shortName: p.shortName, pid, name: p.name }),
        impactScore: r.impactScore,
      };
    },
  })),

  // ── Section B: No grievance mechanism ─────────────────────────────────────
  ...PRINCIPLE_IDS.map((pid): RecommendationRule => ({
    check: (_scoring, report) => {
      const pd = report.sectionB.policyDisclosures.find((p) => p.principleId === pid);
      if (!pd || pd.hasGrievanceMechanism) return null;
      const p = PRINCIPLES[pid];
      const r = recs.sectionBNoGrievance;
      return {
        principleId: pid,
        section: 'B',
        category: r.category,
        priority: r.priority,
        title: formatTemplate(r.titleTemplate, { shortName: p.shortName, pid, name: p.name }),
        description: formatTemplate(r.descriptionTemplate, { shortName: p.shortName, pid, name: p.name }),
        currentState: 'No grievance mechanism disclosed',
        suggestedAction: formatTemplate(r.suggestedActionTemplate, { shortName: p.shortName, pid, name: p.name }),
        impactScore: r.impactScore,
      };
    },
  })),

  // ── Section C: Low principle scores ───────────────────────────────────────
  ...PRINCIPLE_IDS.map((pid): RecommendationRule => ({
    check: (scoring) => {
      const ps = scoring.principleScores.find((p) => p.principleId === pid);
      if (!ps || ps.percentage >= 40) return null;
      const p = PRINCIPLES[pid];
      const r = recs.sectionCLowScore;
      return {
        principleId: pid,
        section: 'C',
        category: r.category,
        priority: ps.percentage < 15 ? 'critical' : 'high',
        title: formatTemplate(r.titleTemplate, { shortName: p.shortName, percentage: ps.percentage, name: p.name }),
        description: formatTemplate(r.descriptionTemplate, { shortName: p.shortName, percentage: ps.percentage, name: p.name }),
        currentState: `${ps.percentage}% — ${ps.essentialScore}/${ps.essentialMax} essential, ${ps.leadershipScore}/${ps.leadershipMax} leadership`,
        suggestedAction: formatTemplate(r.suggestedActionTemplate, { shortName: p.shortName, percentage: ps.percentage, name: p.name }),
        impactScore: r.impactScoreBase - Math.round(ps.percentage / 10),
      };
    },
  })),

  // ── Section C: Missing leadership indicators ──────────────────────────────
  ...PRINCIPLE_IDS.map((pid): RecommendationRule => ({
    check: (scoring) => {
      const ps = scoring.principleScores.find((p) => p.principleId === pid);
      if (!ps || ps.leadershipScore > 0 || ps.leadershipMax === 0) return null;
      const p = PRINCIPLES[pid];
      const r = recs.sectionCMissingLeadership;
      return {
        principleId: pid,
        section: 'C',
        category: r.category,
        priority: r.priority,
        title: formatTemplate(r.titleTemplate, { shortName: p.shortName, name: p.name }),
        description: formatTemplate(r.descriptionTemplate, { shortName: p.shortName, name: p.name }),
        currentState: '0 leadership indicators disclosed',
        suggestedAction: formatTemplate(r.suggestedActionTemplate, { shortName: p.shortName, name: p.name }),
        impactScore: r.impactScore,
      };
    },
  })),

  // ── Section A: Missing workforce data ─────────────────────────────────────
  {
    check: (_scoring, report) => {
      const wf = report.sectionA.workforce;
      if (wf['totalEmployees'] !== undefined) return null;
      return {
        principleId: 'P3' as PrincipleId,
        section: 'A',
        category: 'disclosure',
        priority: 'high',
        title: 'Disclose Complete Workforce Data',
        description: 'Total employee count is missing from Section A. Workforce data is fundamental to BRSR.',
        currentState: 'No workforce data found',
        suggestedAction: 'Include total employees, workers, gender breakdowns, and diversity statistics in Section A.',
        impactScore: 6,
      };
    },
  },

  // ── Section A: Missing governance data ────────────────────────────────────
  {
    check: (_scoring, report) => {
      const gov = report.sectionA.governance;
      if (gov['sustainabilityCommittee']) return null;
      return {
        principleId: 'P1' as PrincipleId,
        section: 'A',
        category: 'governance',
        priority: 'high',
        title: 'Establish a Sustainability Committee',
        description: 'No sustainability committee found. A dedicated committee signals governance commitment to ESG.',
        currentState: 'No sustainability committee disclosed',
        suggestedAction: 'Form a board-level sustainability/ESG committee with a clear charter and regular meeting cadence.',
        impactScore: 5,
      };
    },
  },

  // ── P6: Environmental data quality ────────────────────────────────────────
  {
    check: (_scoring, report) => {
      const p6 = report.sectionC.principles.find((p) => p.principleId === 'P6');
      if (!p6) return null;
      const energyIndicator = p6.essentialIndicators.find((i) => i.id === 'P6-E1');
      if (energyIndicator?.isDisclosed) return null;
      return {
        principleId: 'P6' as PrincipleId,
        section: 'C',
        category: 'measurement',
        priority: 'critical',
        title: 'Disclose Energy Consumption Data',
        description: 'Energy consumption and intensity data is missing — a core environmental metric.',
        currentState: 'Energy data not disclosed',
        suggestedAction: 'Track and report total energy consumption (GJ), energy intensity ratio, and renewable energy percentage.',
        impactScore: 8,
      };
    },
  },

  {
    check: (_scoring, report) => {
      const p6 = report.sectionC.principles.find((p) => p.principleId === 'P6');
      if (!p6) return null;
      const ghgIndicator = p6.essentialIndicators.find((i) => i.id === 'P6-E4');
      if (ghgIndicator?.isDisclosed) return null;
      return {
        principleId: 'P6' as PrincipleId,
        section: 'C',
        category: 'measurement',
        priority: 'critical',
        title: 'Disclose GHG Emissions (Scope 1 & 2)',
        description: 'Greenhouse gas emissions data is missing — essential for climate disclosure.',
        currentState: 'GHG emissions not disclosed',
        suggestedAction: 'Measure and report Scope 1 (direct) and Scope 2 (energy indirect) GHG emissions in tCO2e.',
        impactScore: 8,
      };
    },
  },
];

// ─── Main Engine ────────────────────────────────────────────────────────────
export class RecommendationEngine {
  generate(scoring: ScoringResult, report?: BrsrReport): Recommendation[] {
    logger.info('Generating recommendations...');

    // If no report available, use a minimal one for rules that only need scoring
    const safeReport: BrsrReport = report ?? {
      metadata: { companyName: '', cin: '', financialYear: '', pageCount: 0, extractionConfidence: 0 },
      sectionA: { entityDetails: {}, operations: {}, workforce: {}, governance: {}, rawText: '' },
      sectionB: { policyDisclosures: [], rawText: '' },
      sectionC: { principles: [] },
    };

    const recommendations: Recommendation[] = [];

    for (const rule of RULES) {
      try {
        const match = rule.check(scoring, safeReport);
        if (match) {
          recommendations.push({
            id: uuidv4(),
            principleId: match.principleId,
            principleName: PRINCIPLES[match.principleId].name,
            section: match.section,
            category: match.category,
            priority: match.priority,
            title: match.title,
            description: match.description,
            currentState: match.currentState,
            suggestedAction: match.suggestedAction,
            impactScore: match.impactScore,
          });
        }
      } catch {
        // Skip rules that fail — defensive
      }
    }

    // Sort: critical → high → medium → low, then by impact score
    const priorityOrder: Record<RecommendationPriority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    recommendations.sort((a, b) => {
      const diff = priorityOrder[a.priority] - priorityOrder[b.priority];
      return diff !== 0 ? diff : b.impactScore - a.impactScore;
    });

    logger.info(`Generated ${recommendations.length} recommendations`);
    return recommendations;
  }
}
