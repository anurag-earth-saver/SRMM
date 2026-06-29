import type { XbrlFact } from './parser.js';

export class XbrlMapper {
  /**
   * Maps extracted XBRL facts to raw report data blocks.
   */
  map(facts: XbrlFact[]) {
    // In a real implementation, this reads from taxonomy.ts to map XBRL namespaces
    // (e.g. in-brsr:NameOfTheEntity) to internal business objects.
    
    const getValue = (key: string) => facts.find(f => f.name === key)?.value;

    return {
      entityDetails: {
        companyName: getValue('in-brsr:NameOfTheEntity') || 'XBRL Corp (Mock)',
        cin: getValue('in-brsr:CorporateIdentityNumberCINOfTheEntity') || 'L12345MH2023PLC123456',
        financialYear: getValue('in-brsr:ReportingPeriod') || '2023-24',
      },
      workforce: {
        totalEmployees: parseInt(getValue('in-brsr:TotalEmployees') || '0', 10),
      }
    };
  }
}
