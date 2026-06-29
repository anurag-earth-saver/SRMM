// ─── Client Constants ───────────────────────────────────────────────────────
export const API_BASE = '/api';

export const ROUTES = {
  HOME: '/',
  UPLOAD: '/upload',
  DASHBOARD: '/dashboard/:analysisId',
  RECOMMENDATIONS: '/dashboard/:analysisId/recommendations',
  REPORT_VIEW: '/dashboard/:analysisId/report',
} as const;

export function buildRoute(route: string, params: Record<string, string>): string {
  let path = route;
  for (const [key, value] of Object.entries(params)) {
    path = path.replace(`:${key}`, value);
  }
  return path;
}

export const QUERY_KEYS = {
  analysis: (id: string) => ['analysis', id] as const,
  analyses: (page: number) => ['analyses', page] as const,
} as const;

export const POLL_INTERVAL_MS = 2000;
