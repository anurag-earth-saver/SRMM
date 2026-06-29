// ─── Sidebar ────────────────────────────────────────────────────────────────
import { NavLink, useParams } from 'react-router-dom';
import { Home, Upload, LayoutDashboard, Lightbulb, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buildRoute, ROUTES } from '@/lib/constants';

const baseItems = [
  { to: ROUTES.HOME, icon: Home, label: 'Home' },
  { to: ROUTES.UPLOAD, icon: Upload, label: 'Upload Report' },
];

export function Sidebar() {
  const { analysisId } = useParams<{ analysisId: string }>();

  const items = [
    ...baseItems,
    ...(analysisId
      ? [
          { to: buildRoute(ROUTES.DASHBOARD, { analysisId }), icon: LayoutDashboard, label: 'Dashboard' },
          { to: buildRoute(ROUTES.RECOMMENDATIONS, { analysisId }), icon: Lightbulb, label: 'Recommendations' },
          { to: buildRoute(ROUTES.REPORT_VIEW, { analysisId }), icon: BookOpen, label: 'Report Data' },
        ]
      : []),
  ];

  return (
    <aside className="hidden md:flex w-56 flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card))]/50 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <nav className="flex flex-col gap-1 p-3">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                  : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]',
              )
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
