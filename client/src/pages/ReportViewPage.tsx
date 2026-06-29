// ─── Report View Page ───────────────────────────────────────────────────────
import { useParams } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAnalysis } from '@/hooks/useAnalysis';

export function ReportViewPage() {
  const { analysisId } = useParams<{ analysisId: string }>();
  const { data: analysis, isLoading } = useAnalysis(analysisId ?? null);

  if (isLoading || !analysis?.report) {
    return <PageShell title="Report Data"><p className="text-[hsl(var(--muted-foreground))]">Loading report data...</p></PageShell>;
  }

  const { report } = analysis;

  return (
    <PageShell title="Extracted Report Data" description={`From ${analysis.fileName}`}>
      <div className="space-y-4 max-w-3xl">
        <Card>
          <CardHeader><CardTitle>Metadata</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-[hsl(var(--muted-foreground))]">Company</span><span className="font-medium">{report.metadata.companyName}</span></div>
            <div className="flex justify-between"><span className="text-[hsl(var(--muted-foreground))]">CIN</span><span className="font-medium">{report.metadata.cin || '—'}</span></div>
            <div className="flex justify-between"><span className="text-[hsl(var(--muted-foreground))]">Financial Year</span><span className="font-medium">{report.metadata.financialYear}</span></div>
            <div className="flex justify-between"><span className="text-[hsl(var(--muted-foreground))]">Pages</span><span className="font-medium">{report.metadata.pageCount}</span></div>
            <div className="flex justify-between"><span className="text-[hsl(var(--muted-foreground))]">Confidence</span><span className="font-medium">{Math.round(report.metadata.extractionConfidence * 100)}%</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Policy Disclosures (Section B)</CardTitle></CardHeader>
          <CardContent>
            {report.sectionB.policyDisclosures.length === 0 ? (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">No policy disclosures extracted yet.</p>
            ) : (
              <div className="space-y-2">
                {report.sectionB.policyDisclosures.map((pd) => (
                  <div key={pd.principleId} className="flex justify-between items-center text-sm">
                    <span>{pd.principleId}</span>
                    <span className={pd.hasPolicy ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}>
                      {pd.hasPolicy ? '✓ Policy exists' : '✗ No policy'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
