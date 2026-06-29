// ─── Scoring Types ──────────────────────────────────────────────────────────
import type { PrincipleId } from '../constants/principles';
import { MaturityLevel } from '../constants/maturityLevels';

export { MaturityLevel };

export interface SectionScore {
  score: number;
  maxScore: number;
  percentage: number;
}

export interface PrincipleScore {
  principleId: PrincipleId;
  principleName: string;
  essentialScore: number;
  essentialMax: number;
  leadershipScore: number;
  leadershipMax: number;
  totalScore: number;
  totalMax: number;
  percentage: number;
}

export interface ScoringResult {
  totalScore: number;
  totalMaxScore: number;
  totalPercentage: number;
  maturityLevel: MaturityLevel;
  maturityLevelName: string;
  sectionScores: {
    sectionA: SectionScore;
    sectionB: SectionScore;
    sectionCEssential: SectionScore;
    sectionCLeadership: SectionScore;
  };
  principleScores: PrincipleScore[];
  scoredAt: string;
}
