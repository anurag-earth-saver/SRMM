// ─── Sector Dashboard Page ───────────────────────────────────────────────────
import { useOutletContext } from 'react-router-dom';
import type { AnalysisResult } from '@brsr-srmm/shared';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export function SectorDashboardPage() {
  const { analysis } = useOutletContext<{ analysis: AnalysisResult }>();

  if (!analysis.scoring) return null;

  const mockData = analysis.scoring.principleScores.map(ps => ({
    principle: ps.principleId,
    companyScore: ps.percentage,
    sectorAverage: Math.max(0, ps.percentage - 15 + Math.random() * 30),
    topQuartile: Math.min(100, ps.percentage + 10 + Math.random() * 20),
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sector Benchmarking</CardTitle>
          <CardDescription>Compare your performance against industry peers (Mock Data).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="principle" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                <Legend />
                <Bar dataKey="companyScore" name="Your Company" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sectorAverage" name="Sector Average" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="topQuartile" name="Top Quartile" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
