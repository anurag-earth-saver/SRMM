// ─── Dashboard Page ─────────────────────────────────────────────────────────
import { useOutletContext } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PRINCIPLES, PRINCIPLE_IDS, MATURITY_LEVELS } from '@brsr-srmm/shared';
import type { AnalysisResult } from '@brsr-srmm/shared';
import { motion } from 'framer-motion';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';

export function DashboardPage() {
  const { analysis } = useOutletContext<{ analysis: AnalysisResult }>();
  
  if (!analysis.scoring) return null;

  const { scoring } = analysis;
  const maturity = MATURITY_LEVELS[scoring.maturityLevel];

  return (
    <div className="space-y-6">
      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>Total Score</CardTitle></CardHeader>
          <CardContent>
            <div className="text-4xl font-bold gradient-text">{scoring.totalScore}</div>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">/ {scoring.totalMaxScore} ({scoring.totalPercentage}%)</p>
            <Badge variant={maturity ? 'default' : 'secondary'} className="mt-2" style={{ backgroundColor: maturity?.color }}>
              {scoring.maturityLevelName}
            </Badge>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader><CardTitle>Section Breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Section A — General Disclosures', data: scoring.sectionScores.sectionA },
              { label: 'Section B — Management', data: scoring.sectionScores.sectionB },
              { label: 'Section C — Essential', data: scoring.sectionScores.sectionCEssential },
              { label: 'Section C — Leadership', data: scoring.sectionScores.sectionCLeadership },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{s.label}</span>
                  <span className="font-medium">{s.data.score}/{s.data.maxScore}</span>
                </div>
                <Progress value={s.data.percentage} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Separator className="my-6" />

      {/* Principle Cards */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="principles">By Principle</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            <Card>
              <CardHeader><CardTitle>Principle Performance Radar</CardTitle></CardHeader>
              <CardContent className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={scoring.principleScores}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="principleId" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                    <Radar
                      name="Score %"
                      dataKey="percentage"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.5}
                    />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="space-y-4 max-h-[22rem] overflow-y-auto pr-2">
              {scoring.principleScores.map((ps, i) => {
                const p = PRINCIPLES[ps.principleId];
                return (
                  <motion.div key={ps.principleId} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: p.color }}>{p.id}</span>
                          <span className="text-sm font-medium">{p.shortName}</span>
                        </div>
                        <Progress value={ps.percentage} />
                        <div className="flex justify-between mt-2 text-xs text-[hsl(var(--muted-foreground))]">
                          <span>{ps.totalScore}/{ps.totalMax} pts</span>
                          <span style={{ color: p.color }} className="font-semibold">{ps.percentage}%</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="principles">
          <div className="space-y-3 mt-4">
            {PRINCIPLE_IDS.map((pid) => {
              const p = PRINCIPLES[pid];
              const ps = scoring.principleScores.find((s) => s.principleId === pid);
              return (
                <Card key={pid}>
                  <CardContent className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: p.color }}>{p.id}</span>
                      <div>
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{p.description}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold" style={{ color: p.color }}>{ps?.percentage ?? 0}%</span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
