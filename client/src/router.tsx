// ─── Router ─────────────────────────────────────────────────────────────────
import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { App } from '@/App';
import { HomePage } from '@/pages/HomePage';
import { UploadPage } from '@/pages/UploadPage';
import { PageShell } from '@/components/layout/PageShell';

const DashboardLayout = lazy(() => import('@/components/layout/DashboardLayout').then(m => ({ default: m.DashboardLayout })));
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const SectorDashboardPage = lazy(() => import('@/pages/SectorDashboardPage').then(m => ({ default: m.SectorDashboardPage })));
const CompanyDashboardPage = lazy(() => import('@/pages/CompanyDashboardPage').then(m => ({ default: m.CompanyDashboardPage })));
const RecommendationsPage = lazy(() => import('@/pages/RecommendationsPage').then(m => ({ default: m.RecommendationsPage })));
const ReportViewPage = lazy(() => import('@/pages/ReportViewPage').then(m => ({ default: m.ReportViewPage })));

const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

function LazyLoad({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<PageShell title="Loading..."><p className="text-[hsl(var(--muted-foreground))]">Loading component...</p></PageShell>}>
      {children}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'upload', element: <UploadPage /> },
      {
        path: 'dashboard/:analysisId',
        element: <LazyLoad><DashboardLayout /></LazyLoad>,
        children: [
          { index: true, element: <LazyLoad><DashboardPage /></LazyLoad> },
          { path: 'sector', element: <LazyLoad><SectorDashboardPage /></LazyLoad> },
          { path: 'company', element: <LazyLoad><CompanyDashboardPage /></LazyLoad> },
        ],
      },
      { path: 'dashboard/:analysisId/recommendations', element: <LazyLoad><RecommendationsPage /></LazyLoad> },
      { path: 'dashboard/:analysisId/report', element: <LazyLoad><ReportViewPage /></LazyLoad> },
      { path: '*', element: <LazyLoad><NotFoundPage /></LazyLoad> },
    ],
  },
]);
