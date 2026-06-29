export interface XbrlFact {
  name: string;
  value: string;
  contextRef?: string;
  unitRef?: string;
}

export class XbrlParser {
  /**
   * Scaffolding for an XBRL XML Parser.
   * Currently mocks extraction to satisfy unified reporting constraints.
   */
  parse(xmlData: string): XbrlFact[] {
    // In a real implementation, this would use a DOMParser or sax parser
    // to extract <xbrli:context>, <xbrli:unit>, and all facts.
    
    // Validate we got something XML-like
    if (!xmlData.includes('<') && !xmlData.includes('>')) {
      throw new Error('Data does not appear to be valid XML/XBRL.');
    }

    return [
      { name: 'in-brsr:NameOfTheEntity', value: 'Mock XBRL Corp' },
      { name: 'in-brsr:CorporateIdentityNumberCINOfTheEntity', value: 'U12345MH2023PTC123456' },
      { name: 'in-brsr:ReportingPeriod', value: '2023-2024' },
      { name: 'in-brsr:TotalEmployees', value: '1500' },
    ];
  }
}
