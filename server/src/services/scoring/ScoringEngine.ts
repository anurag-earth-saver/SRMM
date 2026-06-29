// ─── Scoring Engine (full SRMM 300-point model) ─────────────────────────────
import type { ScoringResult, PrincipleScore, BrsrReport, PrincipleId, SectionScore } from '@brsr-srmm/shared';
import { PRINCIPLE_IDS, PRINCIPLES, getMaturityLevel, MATURITY_LEVELS } from '@brsr-srmm/shared';
import { logger } from '../../utils/logger.js';

import db from '../../config/srmm_database.json' with { type: 'json' };

// ─── Section A Scoring (25 pts) ─────────────────────────────────────────────
// Points based on completeness of general disclosures
function scoreSectionA(report: BrsrReport): SectionScore {
  const maxScore = db.maxScores.sectionA;
  let score = 0;
  const entity = report.sectionA.entityDetails;
  const workforce = report.sectionA.workforce;
  const governance = report.sectionA.governance;

  // Entity details
  const entityFields = db.sectionAFields.entity;
  const entityFound = entityFields.filter((f) => entity[f]).length;
  score += Math.round((entityFound / entityFields.length) * db.sectionAWeights.entity);

  // Operations
  const ops = report.sectionA.operations;
  if (ops['mainBusinessActivity']) score += 1;
  if (Array.isArray(ops['productsServices']) && (ops['productsServices'] as string[]).length > 0) score += 1;
  if (ops['numberOfLocations']) score += 1;
  if (Array.isArray(ops['marketsServed']) && (ops['marketsServed'] as string[]).length > 0) score += 1;

  // Workforce
  const workforceFields = db.sectionAFields.workforce;
  const workforceFound = workforceFields.filter((f) => workforce[f] !== undefined).length;
  score += Math.round((workforceFound / workforceFields.length) * db.sectionAWeights.workforce);

  // Governance
  if (governance['boardSize']) score += 1;
  if (governance['womenDirectorsPercentage']) score += 1;
  if (governance['independentDirectorsPercentage']) score += 1;
  if (governance['csrCommittee']) score += 1.5;
  if (governance['sustainabilityCommittee']) score += 1.5;

  score = Math.min(Math.round(score), maxScore);
  return { score, maxScore, percentage: Math.round((score / maxScore) * 100) };
}

// ─── Section B Scoring (50 pts) ─────────────────────────────────────────────
// Points for policy existence, board approval, public availability, grievance
function scoreSectionB(report: BrsrReport): SectionScore {
  const maxScore = db.maxScores.sectionB;
  let score = 0;
  const perPrinciple = maxScore / PRINCIPLE_IDS.length;
  const w = db.sectionBWeights;

  for (const pd of report.sectionB.policyDisclosures) {
    let principleScore = 0;
    if (pd.hasPolicy) principleScore += w.hasPolicy;
    if (pd.policyApprovedByBoard) principleScore += w.boardApproval;
    if (pd.policyPubliclyAvailable) principleScore += w.publicAvailability;
    if (pd.hasGrievanceMechanism) principleScore += w.grievanceMechanism;
    score += principleScore * perPrinciple;
  }

  score = Math.min(Math.round(score), maxScore);
  return { score, maxScore, percentage: Math.round((score / maxScore) * 100) };
}

// ─── Section C Scoring (225 pts = 150 essential + 75 leadership) ────────────
// Points based on disclosure completeness and data quality
interface SectionCScores {
  essential: SectionScore;
  leadership: SectionScore;
  principleScores: PrincipleScore[];
}

function scoreSectionC(report: BrsrReport): SectionCScores {
  const essentialMax = db.maxScores.sectionCEssential;
  const leadershipMax = db.maxScores.sectionCLeadership;
  const pCount = PRINCIPLE_IDS.length;

  const principleScores: PrincipleScore[] = PRINCIPLE_IDS.map((pid) => {
    const principleData = report.sectionC.principles.find((p) => p.principleId === pid);
    const principle = PRINCIPLES[pid];

    const eMax = Math.round(essentialMax / pCount);
    const lMax = Math.round(leadershipMax / pCount);

    if (!principleData) {
      return {
        principleId: pid,
        principleName: principle.name,
        essentialScore: 0,
        essentialMax: eMax,
        leadershipScore: 0,
        leadershipMax: lMax,
        totalScore: 0,
        totalMax: eMax + lMax,
        percentage: 0,
      };
    }

    const essentialScore = scoreIndicators(principleData.essentialIndicators, eMax);
    const leadershipScore = scoreIndicators(principleData.leadershipIndicators, lMax);
    const totalScore = essentialScore + leadershipScore;
    const totalMax = eMax + lMax;

    return {
      principleId: pid,
      principleName: principle.name,
      essentialScore,
      essentialMax: eMax,
      leadershipScore,
      leadershipMax: lMax,
      totalScore,
      totalMax,
      percentage: totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0,
    };
  });

  const totalEssential = principleScores.reduce((s, p) => s + p.essentialScore, 0);
  const totalLeadership = principleScores.reduce((s, p) => s + p.leadershipScore, 0);

  return {
    essential: {
      score: totalEssential,
      maxScore: essentialMax,
      percentage: Math.round((totalEssential / essentialMax) * 100),
    },
    leadership: {
      score: totalLeadership,
      maxScore: leadershipMax,
      percentage: Math.round((totalLeadership / leadershipMax) * 100),
    },
    principleScores,
  };
}

function scoreIndicators(indicators: BrsrReport['sectionC']['principles'][0]['essentialIndicators'], maxPoints: number): number {
  if (indicators.length === 0) return 0;
  const w = db.sectionCWeights;

  const pointsPerIndicator = maxPoints / indicators.length;
  let score = 0;

  for (const indicator of indicators) {
    if (!indicator.isDisclosed) continue;

    let indicatorScore = w.baseDisclosure;

    if (indicator.dataPoints.length > 0) {
      indicatorScore += w.hasData;
    }
    if (indicator.dataPoints.length >= 2) {
      indicatorScore += w.hasMultipleData;
    }
    if (indicator.response && indicator.response.length > 10) {
      indicatorScore += w.hasDetailedResponse;
    }

    score += Math.min(indicatorScore, 1) * pointsPerIndicator;
  }

  return Math.round(score);
}

// ─── Main Scoring Engine ────────────────────────────────────────────────────
export class ScoringEngine {
  score(report: BrsrReport): ScoringResult {
    logger.info('Calculating SRMM scores...');

    const sectionA = scoreSectionA(report);
    const sectionB = scoreSectionB(report);
    const sectionC = scoreSectionC(report);

    const totalScore = sectionA.score + sectionB.score + sectionC.essential.score + sectionC.leadership.score;
    const totalMaxScore = db.maxScores.total;
    const totalPercentage = Math.round((totalScore / totalMaxScore) * 100);
    const maturityLevel = getMaturityLevel(totalPercentage);
    const maturityInfo = MATURITY_LEVELS[maturityLevel];

    logger.info(`Scoring complete — ${totalScore}/${totalMaxScore} (${totalPercentage}%) — ${maturityInfo.name}`);

    return {
      totalScore,
      totalMaxScore,
      totalPercentage,
      maturityLevel,
      maturityLevelName: maturityInfo.name,
      sectionScores: {
        sectionA,
        sectionB,
        sectionCEssential: sectionC.essential,
        sectionCLeadership: sectionC.leadership,
      },
      principleScores: sectionC.principleScores,
      scoredAt: new Date().toISOString(),
    };
  }
}
