import type { XbrlFact } from './parser.js';

/** Indexed lookup over parsed XBRL facts. */
export class FactIndex {
  private byName = new Map<string, XbrlFact[]>();
  private byKey = new Map<string, XbrlFact>();

  constructor(facts: XbrlFact[]) {
    for (const fact of facts) {
      const list = this.byName.get(fact.name) ?? [];
      list.push(fact);
      this.byName.set(fact.name, list);
      this.byKey.set(`${fact.name}::${fact.contextRef ?? ''}`, fact);
    }
  }

  get count(): number {
    return this.byKey.size;
  }

  getAll(name: string): XbrlFact[] {
    return this.byName.get(name) ?? [];
  }

  getFirst(name: string, contextPattern?: string | RegExp): XbrlFact | undefined {
    const facts = this.getAll(name);
    if (facts.length === 0) return undefined;
    if (!contextPattern) return facts[0];
    const pattern = typeof contextPattern === 'string' ? new RegExp(contextPattern) : contextPattern;
    return facts.find((f) => f.contextRef && pattern.test(f.contextRef));
  }

  getValue(name: string, contextPattern?: string | RegExp): string | undefined {
    return this.getFirst(name, contextPattern)?.value;
  }

  hasTruthyValue(name: string, contextPattern?: string | RegExp): boolean {
    const value = this.getValue(name, contextPattern);
    return isTruthyXbrlValue(value);
  }

  /** First non-empty value across element aliases and optional context filters. */
  resolveValue(elements: string[], contexts?: string[]): string | undefined {
    for (const element of elements) {
      if (contexts && contexts.length > 0) {
        for (const ctx of contexts) {
          const value = this.getValue(element, ctx);
          if (value !== undefined && value !== '') return value;
        }
      } else {
        const fact = this.getFirst(element);
        if (fact?.value !== undefined && fact.value !== '') return fact.value;
      }
    }
    return undefined;
  }

  /** Whether any alias has a meaningful disclosed value. */
  isDisclosed(elements: string[], contextPattern?: string | RegExp): boolean {
    const pattern = contextPattern
      ? typeof contextPattern === 'string'
        ? new RegExp(contextPattern)
        : contextPattern
      : undefined;
    for (const element of elements) {
      const facts = this.getAll(element);
      for (const fact of facts) {
        if (pattern && fact.contextRef && !pattern.test(fact.contextRef)) continue;
        if (isTruthyXbrlValue(fact.value)) return true;
      }
    }
    return false;
  }

  collectDataPoints(elements: string[], label: string, contextPattern?: RegExp): Array<{ label: string; value: string; unit?: string }> {
    const points: Array<{ label: string; value: string; unit?: string }> = [];
    for (const element of elements) {
      for (const fact of this.getAll(element)) {
        if (contextPattern && fact.contextRef && !contextPattern.test(fact.contextRef)) continue;
        if (!isTruthyXbrlValue(fact.value)) continue;
        points.push({ label, value: fact.value, unit: fact.unitRef });
        if (points.length >= 3) return points;
      }
    }
    return points;
  }
}

export function isTruthyXbrlValue(value: string | undefined): boolean {
  if (value === undefined) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  if (lower === 'false' || lower === 'no' || lower === 'n/a' || lower === 'na' || lower === 'not applicable') {
    return false;
  }
  return true;
}

export function parseBoolean(value: string | undefined): boolean {
  if (!value) return false;
  const lower = value.trim().toLowerCase();
  return lower === 'true' || lower === 'yes' || lower === '1';
}

export function parseNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = parseFloat(value.replace(/,/g, ''));
  return Number.isFinite(n) ? n : undefined;
}

export function toPercentage(value: string | undefined): number | undefined {
  const n = parseNumber(value);
  if (n === undefined) return undefined;
  // XBRL often stores ratios (0.3334) rather than percent (33.34)
  return n <= 1 && n >= 0 ? Math.round(n * 10000) / 100 : n;
}
