import { describe, it, expect } from 'vitest';
import { XbrlParser } from './services/ingestion/xbrl/parser.js';
import { XbrlMapper } from './services/ingestion/xbrl/mapper.js';
import { XbrlNormalizer } from './services/ingestion/xbrl/normalizer.js';
import { isTruthyXbrlValue } from './services/ingestion/xbrl/FactIndex.js';

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<xbrli:xbrl xmlns:xbrli="http://www.xbrl.org/2003/instance" xmlns:in-capmkt="https://www.sebi.gov.in/xbrl/2025-05-31/in-capmkt">
  <xbrli:context id="DCYMain"><xbrli:entity><xbrli:identifier scheme="cin">L85110WB1987PLC222139</xbrli:identifier></xbrli:entity>
  <xbrli:period><xbrli:startDate>2024-04-01</xbrli:startDate><xbrli:endDate>2025-03-31</xbrli:endDate></xbrli:period></xbrli:context>
  <xbrli:context id="ICYMain"><xbrli:entity><xbrli:identifier scheme="cin">L85110WB1987PLC222139</xbrli:identifier></xbrli:entity>
  <xbrli:period><xbrli:instant>2025-03-31</xbrli:instant></xbrli:period></xbrli:context>
  <xbrli:context id="D_Principle1"><xbrli:entity><xbrli:identifier scheme="cin">L85110WB1987PLC222139</xbrli:identifier></xbrli:entity>
  <xbrli:period><xbrli:startDate>2024-04-01</xbrli:startDate><xbrli:endDate>2025-03-31</xbrli:endDate></xbrli:period></xbrli:context>
  <xbrli:context id="D_Gender_Employees_TableA"><xbrli:entity><xbrli:identifier scheme="cin">L85110WB1987PLC222139</xbrli:identifier></xbrli:entity>
  <xbrli:period><xbrli:startDate>2024-04-01</xbrli:startDate><xbrli:endDate>2025-03-31</xbrli:endDate></xbrli:period></xbrli:context>
  <in-capmkt:NameOfTheCompany contextRef="ICYMain">Apeejay Surrendra Park Hotels Limited</in-capmkt:NameOfTheCompany>
  <in-capmkt:CorporateIdentityNumber contextRef="DCYMain">L85110WB1987PLC222139</in-capmkt:CorporateIdentityNumber>
  <in-capmkt:DateOfStartOfFinancialYear contextRef="DCYMain">2024-04-01</in-capmkt:DateOfStartOfFinancialYear>
  <in-capmkt:DateOfEndOfFinancialYear contextRef="DCYMain">2025-03-31</in-capmkt:DateOfEndOfFinancialYear>
  <in-capmkt:TotalNumberOfBoardOfDirectors contextRef="DCYMain">6</in-capmkt:TotalNumberOfBoardOfDirectors>
  <in-capmkt:PercentageOfFemaleBoardOfDirectors contextRef="DCYMain">0.3334</in-capmkt:PercentageOfFemaleBoardOfDirectors>
  <in-capmkt:DoesTheEntityHaveAnAntiCorruptionOrAntiBriberyPolicy contextRef="DCYMain">Yes</in-capmkt:DoesTheEntityHaveAnAntiCorruptionOrAntiBriberyPolicy>
  <in-capmkt:TotalScope1Emissions contextRef="DCYMain">1966.68</in-capmkt:TotalScope1Emissions>
  <in-capmkt:TotalScope2Emissions contextRef="DCYMain">15346.54</in-capmkt:TotalScope2Emissions>
  <in-capmkt:NumberOfEmployeesOrWorkersIncludingDifferentlyAbled contextRef="D_Gender_Employees_TableA">3993</in-capmkt:NumberOfEmployeesOrWorkersIncludingDifferentlyAbled>
  <in-capmkt:WhetherYourEntitysPolicyOrPoliciesCoverEachPrincipleAndItsCoreElementsOfTheNGRBCs contextRef="D_Principle1">Yes</in-capmkt:WhetherYourEntitysPolicyOrPoliciesCoverEachPrincipleAndItsCoreElementsOfTheNGRBCs>
  <in-capmkt:HasThePolicyBeenApprovedByTheBoard contextRef="D_Principle1">Yes</in-capmkt:HasThePolicyBeenApprovedByTheBoard>
  <in-capmkt:WebLinkOfThePoliciesExplanatoryTextBlock contextRef="D_Principle1">https://example.com/policies</in-capmkt:WebLinkOfThePoliciesExplanatoryTextBlock>
</xbrli:xbrl>`;

describe('XBRL Pipeline', () => {
  it('parses facts from XML', () => {
    const parser = new XbrlParser();
    const facts = parser.parse(SAMPLE_XML);
    expect(facts.length).toBeGreaterThan(5);
    expect(facts.some((f) => f.name === 'NameOfTheCompany')).toBe(true);
  });

  it('maps entity details and indicators from real taxonomy elements', () => {
    const parser = new XbrlParser();
    const mapper = new XbrlMapper();
    const mapped = mapper.map(parser.parse(SAMPLE_XML));

    expect(mapped.entityDetails.companyName).toBe('Apeejay Surrendra Park Hotels Limited');
    expect(mapped.entityDetails.cin).toBe('L85110WB1987PLC222139');
    expect(mapped.financialYear).toBe('2024-25');
    expect(mapped.workforce.totalEmployees).toBe(3993);
    expect(mapped.indicators['P1-E3']?.disclosed).toBe(true);
    expect(mapped.indicators['P6-E4']?.disclosed).toBe(true);
    expect(mapped.policyDisclosures[0]?.hasPolicy).toBe(true);
  });

  it('normalizes into BrsrReport without mock placeholders', () => {
    const parser = new XbrlParser();
    const mapper = new XbrlMapper();
    const normalizer = new XbrlNormalizer();
    const report = normalizer.normalize(mapper.map(parser.parse(SAMPLE_XML)));

    expect(report.metadata.companyName).not.toContain('Mock');
    expect(report.sectionC.principles[0]?.essentialIndicators.length).toBeGreaterThan(1);
    expect(report.sectionC.principles.find((p) => p.principleId === 'P6')?.essentialIndicators.some((i) => i.isDisclosed)).toBe(true);
  });

  it('treats false/no as not disclosed', () => {
    expect(isTruthyXbrlValue('false')).toBe(false);
    expect(isTruthyXbrlValue('Yes')).toBe(true);
    expect(isTruthyXbrlValue('1966.68')).toBe(true);
  });
});
