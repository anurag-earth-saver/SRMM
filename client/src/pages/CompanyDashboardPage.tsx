// ─── Company Dashboard Page ──────────────────────────────────────────────────
import { useOutletContext } from 'react-router-dom';
import type { AnalysisResult } from '@brsr-srmm/shared';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PRINCIPLES } from '@brsr-srmm/shared';

export function CompanyDashboardPage() {
  const { analysis } = useOutletContext<{ analysis: AnalysisResult }>();

  if (!analysis.report) return null;

  const { sectionA, sectionC } = analysis.report;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Entity Details (Section A)</CardTitle>
          <CardDescription>General company and operational information extracted from the report.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm border-b pb-1">Corporate Details</h3>
              <ul className="text-sm space-y-1">
                <li><span className="text-muted-foreground mr-2">Company Name:</span>{sectionA.entityDetails.companyName ?? 'N/A'}</li>
                <li><span className="text-muted-foreground mr-2">CIN:</span>{sectionA.entityDetails.cin ?? 'N/A'}</li>
                <li><span className="text-muted-foreground mr-2">Year of Incorporation:</span>{sectionA.entityDetails.yearOfIncorporation ?? 'N/A'}</li>
                <li><span className="text-muted-foreground mr-2">Registered Address:</span>{sectionA.entityDetails.registeredAddress ?? 'N/A'}</li>
                <li><span className="text-muted-foreground mr-2">Email:</span>{sectionA.entityDetails.email ?? 'N/A'}</li>
                <li><span className="text-muted-foreground mr-2">Website:</span>{sectionA.entityDetails.website ?? 'N/A'}</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm border-b pb-1">Workforce & Governance</h3>
              <ul className="text-sm space-y-1">
                <li><span className="text-muted-foreground mr-2">Total Employees:</span>{sectionA.workforce.totalEmployees ?? 'N/A'}</li>
                <li><span className="text-muted-foreground mr-2">Women Employees:</span>{sectionA.workforce.womenEmployeesPercentage ? `${sectionA.workforce.womenEmployeesPercentage}%` : 'N/A'}</li>
                <li><span className="text-muted-foreground mr-2">Board Size:</span>{sectionA.governance.boardSize ? String(sectionA.governance.boardSize) : 'N/A'}</li>
                <li><span className="text-muted-foreground mr-2">Women Directors:</span>{sectionA.governance.womenDirectorsPercentage ? `${String(sectionA.governance.womenDirectorsPercentage)}%` : 'N/A'}</li>
                <li><span className="text-muted-foreground mr-2">CSR Committee:</span>{sectionA.governance.csrCommittee ? 'Yes' : 'No'}</li>
                <li><span className="text-muted-foreground mr-2">Sustainability Committee:</span>{sectionA.governance.sustainabilityCommittee ? 'Yes' : 'No'}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Principle Disclosures (Section C)</CardTitle>
          <CardDescription>Detailed overview of essential indicators by principle.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {sectionC.principles.map(p => (
              <div key={p.principleId} className="border rounded-md p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: PRINCIPLES[p.principleId].color }}>
                      {p.principleId}
                    </span>
                    <h3 className="font-semibold">{PRINCIPLES[p.principleId].name}</h3>
                  </div>
                  <Badge variant="outline">{p.essentialIndicators.filter(i => i.isDisclosed).length} / {p.essentialIndicators.length} Disclosed</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {p.essentialIndicators.map(ind => (
                    <div key={ind.id} className={`p-3 rounded-md ${ind.isDisclosed ? 'bg-primary/5 border border-primary/20' : 'bg-muted/50 border border-border'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">{ind.question}</span>
                        <Badge variant={ind.isDisclosed ? 'default' : 'secondary'} className="text-[10px] ml-2 shrink-0">
                          {ind.isDisclosed ? 'Disclosed' : 'Missing'}
                        </Badge>
                      </div>
                      {ind.dataPoints.length > 0 && (
                        <div className="mt-2 text-xs">
                          <ul className="list-disc list-inside text-muted-foreground">
                            {ind.dataPoints.map((dp, i) => (
                              <li key={i}>{dp.label}: <span className="text-foreground font-medium">{dp.value} {dp.unit || ''}</span></li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
