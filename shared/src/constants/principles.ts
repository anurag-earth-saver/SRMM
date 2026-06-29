// ─── Principle ID Type ──────────────────────────────────────────────────────
export type PrincipleId = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6' | 'P7' | 'P8' | 'P9';

export const PRINCIPLE_IDS: PrincipleId[] = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9'];

export interface PrincipleDefinition {
  id: PrincipleId;
  number: number;
  name: string;
  shortName: string;
  description: string;
  color: string;
}

export const PRINCIPLES: Record<PrincipleId, PrincipleDefinition> = {
  P1: { id: 'P1', number: 1, name: 'Ethics, Transparency & Accountability', shortName: 'Ethics', description: 'Conduct with integrity, ethics, transparency and accountability.', color: '#6366f1' },
  P2: { id: 'P2', number: 2, name: 'Sustainable & Safe Products/Services', shortName: 'Products', description: 'Provide goods and services sustainably and safely.', color: '#8b5cf6' },
  P3: { id: 'P3', number: 3, name: 'Employee & Worker Well-being', shortName: 'Employees', description: 'Promote well-being of all employees and workers.', color: '#06b6d4' },
  P4: { id: 'P4', number: 4, name: 'Stakeholder Engagement', shortName: 'Stakeholders', description: 'Respect interests of and be responsive to stakeholders.', color: '#14b8a6' },
  P5: { id: 'P5', number: 5, name: 'Human Rights', shortName: 'Human Rights', description: 'Respect and promote human rights.', color: '#f59e0b' },
  P6: { id: 'P6', number: 6, name: 'Environmental Responsibility', shortName: 'Environment', description: 'Protect and restore the environment.', color: '#10b981' },
  P7: { id: 'P7', number: 7, name: 'Responsible Policy Advocacy', shortName: 'Policy', description: 'Engage in responsible and transparent policy advocacy.', color: '#3b82f6' },
  P8: { id: 'P8', number: 8, name: 'Inclusive Growth & Equitable Development', shortName: 'Inclusion', description: 'Promote inclusive growth and equitable development.', color: '#ec4899' },
  P9: { id: 'P9', number: 9, name: 'Customer Value & Responsible Consumption', shortName: 'Customers', description: 'Provide value to consumers responsibly.', color: '#f97316' },
};
