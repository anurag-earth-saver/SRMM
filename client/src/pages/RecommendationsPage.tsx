// ─── Recommendations Page ───────────────────────────────────────────────────
import { useParams } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAnalysis } from '@/hooks/useAnalysis';
import { PRINCIPLES } from '@brsr-srmm/shared';
import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';

const PRIORITY_VARIANT = { critical: 'destructive', high: 'warning', medium: 'secondary', low: 'success' } as const;

export function RecommendationsPage() {
  const { analysisId } = useParams<{ analysisId: string }>();
  const { data: analysis, isLoading } = useAnalysis(analysisId ?? null);

  if (isLoading || !analysis) {
    return <PageShell title="Recommendations"><p className="text-[hsl(var(--muted-foreground))]">Loading...</p></PageShell>;
  }

  const recs = analysis.recommendations;

  return (
    <PageShell title="Recommendations" description={`${recs.length} improvement suggestions for ${analysis.companyName}`}>
      {recs.length === 0 ? (
        <div className="text-center py-16">
          <Lightbulb className="w-12 h-12 mx-auto text-[hsl(var(--muted-foreground))] mb-4" />
          <p className="font-semibold">No recommendations yet</p>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Recommendations will appear after analysis is complete.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recs.map((rec, i) => {
            const principle = PRINCIPLES[rec.principleId];
            return (
              <motion.div key={rec.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm">{rec.title}</h3>
                      <Badge variant={PRIORITY_VARIANT[rec.priority]}>{rec.priority}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-xs px-1.5 py-0.5 rounded text-white font-medium" style={{ backgroundColor: principle.color }}>{principle.id}</span>
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">{rec.category} · Section {rec.section}</span>
                    </div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{rec.description}</p>
                    <div className="bg-[hsl(var(--muted))] rounded-lg p-3">
                      <p className="text-xs font-medium mb-1">Suggested Action</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">{rec.suggestedAction}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
