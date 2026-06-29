// ─── SRMM Maturity Level Definitions ────────────────────────────────────────
export enum MaturityLevel {
  FORMATIVE = 1,
  EMERGING = 2,
  ESTABLISHED = 3,
  LEADING = 4,
}

export interface MaturityLevelInfo {
  level: MaturityLevel;
  name: string;
  description: string;
  minPercentage: number;
  maxPercentage: number;
  color: string;
}

export const MATURITY_LEVELS: Record<MaturityLevel, MaturityLevelInfo> = {
  [MaturityLevel.FORMATIVE]: { level: MaturityLevel.FORMATIVE, name: 'Formative', description: 'Initial stage — establishing basics.', minPercentage: 0, maxPercentage: 25, color: '#ef4444' },
  [MaturityLevel.EMERGING]: { level: MaturityLevel.EMERGING, name: 'Emerging', description: 'Formalizing processes and controls.', minPercentage: 25, maxPercentage: 50, color: '#f59e0b' },
  [MaturityLevel.ESTABLISHED]: { level: MaturityLevel.ESTABLISHED, name: 'Established', description: 'Implementation and compliance focused.', minPercentage: 50, maxPercentage: 75, color: '#3b82f6' },
  [MaturityLevel.LEADING]: { level: MaturityLevel.LEADING, name: 'Leading by Example', description: 'Industry benchmark, deep integration.', minPercentage: 75, maxPercentage: 100, color: '#10b981' },
};

export function getMaturityLevel(percentage: number): MaturityLevel {
  if (percentage > 75) return MaturityLevel.LEADING;
  if (percentage > 50) return MaturityLevel.ESTABLISHED;
  if (percentage > 25) return MaturityLevel.EMERGING;
  return MaturityLevel.FORMATIVE;
}
