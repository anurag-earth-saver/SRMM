// ─── Recommendation Types ───────────────────────────────────────────────────
import type { PrincipleId } from '../constants/principles';

export type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low';
export type RecommendationCategory = 'disclosure' | 'policy' | 'implementation' | 'measurement' | 'governance';

export interface Recommendation {
  id: string;
  principleId: PrincipleId;
  principleName: string;
  section: 'A' | 'B' | 'C';
  category: RecommendationCategory;
  priority: RecommendationPriority;
  title: string;
  description: string;
  currentState: string;
  suggestedAction: string;
  impactScore: number;
}
