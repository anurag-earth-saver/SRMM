import { Outlet, useParams, NavLink } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import { useAnalysis } from '@/hooks/useAnalysis';

export function DashboardLayout() {
  const { analysisId } = useParams<{ analysisId: string }>();
  const { data: analysis, isLoading } = useAnalysis(analysisId ?? null);

  if (isLoading || !analysis) {
    return <PageShell title="Dashboard"><p className="text-[hsl(var(--muted-foreground))]">Loading analysis...</p></PageShell>;
  }

  if (!analysis.scoring) {
    return <PageShell title="Dashboard"><p className="text-[hsl(var(--muted-foreground))]">Processing: {analysis.status}...</p></PageShell>;
  }

  const tabs = [
    { label: 'Executive Summary', path: '.' },
    { label: 'Sector Analysis', path: 'sector' },
    { label: 'Company Deep-Dive', path: 'company' },
  ];

  return (
    <PageShell title={analysis.companyName} description={`FY ${analysis.financialYear}`}>
      <div className="mb-6 border-b border-border">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              end
              className={({ isActive }) =>
                `whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-4">
        <Outlet context={{ analysis }} />
      </div>
    </PageShell>
  );
}
