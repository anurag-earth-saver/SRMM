// ─── Header ─────────────────────────────────────────────────────────────────
import { Link } from 'react-router-dom';
import { BarChart3, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';

export function Header() {
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3" id="app-logo">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base font-bold font-[family-name:var(--font-display)]">
              BRSR <span className="gradient-text">SRMM</span>
            </h1>
            <p className="text-[10px] text-[hsl(var(--muted-foreground))] -mt-0.5 uppercase tracking-wide">
              Scoring & Analysis
            </p>
          </div>
        </Link>

        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </div>
    </header>
  );
}
