export interface XbrlFact {
  name: string;
  value: string;
  contextRef?: string;
  unitRef?: string;
}

/** Matches in-capmkt (and legacy) XBRL fact elements with contextRef. */
const FACT_REGEX =
  /<(?:[\w-]+:)([A-Za-z][A-Za-z0-9]*)[^>]*\bcontextRef="([^"]+)"(?:[^>]*\bunitRef="([^"]*)")?[^>]*>([^<]*)<\/(?:[\w-]+:)\1>/g;

export class XbrlParser {
  parse(xmlData: string): XbrlFact[] {
    if (!xmlData.includes('<') || !xmlData.includes('>')) {
      throw new Error('Data does not appear to be valid XML/XBRL.');
    }

    const facts: XbrlFact[] = [];
    const seen = new Set<string>();

    for (const match of xmlData.matchAll(FACT_REGEX)) {
      const name = match[1]!;
      const contextRef = match[2]!;
      const unitRef = match[3];
      const value = decodeXmlEntities(match[4]!.trim());
      const key = `${name}::${contextRef}::${value}`;

      if (seen.has(key)) continue;
      seen.add(key);

      facts.push({ name, value, contextRef, unitRef: unitRef || undefined });
    }

    if (facts.length === 0) {
      throw new Error('No XBRL facts found. The file may use an unsupported format or namespace.');
    }

    return facts;
  }
}

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}
