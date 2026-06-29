// ─── Home Page ──────────────────────────────────────────────────────────────
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, BarChart3, Lightbulb, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ROUTES } from '@/lib/constants';

const features = [
  { icon: Upload, title: 'Upload BRSR PDF', desc: 'Upload your BRSR report in PDF format for automated analysis.' },
  { icon: BarChart3, title: 'Automated Scoring', desc: 'Get instant SRMM maturity scores across all 9 NGRBC principles.' },
  { icon: Lightbulb, title: 'Smart Recommendations', desc: 'Receive prioritized improvement suggestions ranked by impact.' },
];

export function HomePage() {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Hero */}
      <section className="relative px-6 py-20 md:py-32 text-center">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-primary)] rounded-full opacity-[0.04] blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-accent)] rounded-full opacity-[0.04] blur-[120px]" />
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold font-[family-name:var(--font-display)] tracking-tight mb-4 leading-[1.1]">
            BRSR <span className="gradient-text">SRMM</span>
            <br />
            <span className="text-[hsl(var(--muted-foreground))] text-2xl md:text-4xl font-semibold">Scoring & Analysis Platform</span>
          </h1>
          <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-xl mx-auto mb-8">
            Upload your BRSR report. Get automated maturity scoring, interactive dashboards, and actionable recommendations.
          </p>
          <Button asChild size="lg">
            <Link to={ROUTES.UPLOAD} id="cta-upload">
              <Upload className="w-5 h-5" /> Upload BRSR Report <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold font-[family-name:var(--font-display)] text-center mb-12">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
              <Card className="text-center h-full hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center mx-auto mb-4">
                    <f.icon className="w-7 h-7 text-[var(--color-primary)]" />
                  </div>
                  <h3 className="font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">{f.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
