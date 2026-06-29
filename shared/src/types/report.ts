// ─── BRSR Report Types ──────────────────────────────────────────────────────
import type { PrincipleId } from '../constants/principles';

export interface BrsrReport {
  metadata: ReportMetadata;
  sectionA: SectionAData;
  sectionB: SectionBData;
  sectionC: SectionCData;
}

export interface ReportMetadata {
  companyName: string;
  cin: string;
  financialYear: string;
  pageCount: number;
  extractionConfidence: number;
}

export interface SectionAData {
  entityDetails: Record<string, string | undefined>;
  operations: Record<string, unknown>;
  workforce: Record<string, number | undefined>;
  governance: Record<string, unknown>;
  rawText: string;
}

export interface SectionBData {
  policyDisclosures: PolicyDisclosure[];
  rawText: string;
}

export interface PolicyDisclosure {
  principleId: PrincipleId;
  hasPolicy: boolean;
  policyApprovedByBoard?: boolean;
  policyPubliclyAvailable?: boolean;
  hasGrievanceMechanism?: boolean;
}

export interface SectionCData {
  principles: PrincipleData[];
}

export interface PrincipleData {
  principleId: PrincipleId;
  essentialIndicators: Indicator[];
  leadershipIndicators: Indicator[];
}

export interface Indicator {
  id: string;
  question: string;
  response: string | null;
  dataPoints: DataPoint[];
  isDisclosed: boolean;
}

export interface DataPoint {
  label: string;
  value: string | number | null;
  unit?: string;
}
