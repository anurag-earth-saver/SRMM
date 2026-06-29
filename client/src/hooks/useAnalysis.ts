// ─── useAnalysis Hook ───────────────────────────────────────────────────────
import { useQuery } from '@tanstack/react-query';
import { analysisApi } from '@/services/analysisApi';
import { QUERY_KEYS, POLL_INTERVAL_MS } from '@/lib/constants';

export function useAnalysis(id: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.analysis(id ?? ''),
    queryFn: () => analysisApi.getAnalysis(id!),
    enabled: !!id,
    refetchInterval: (query) => {
      const s = query.state.data?.status;
      return s === 'COMPLETED' || s === 'FAILED' ? false : POLL_INTERVAL_MS;
    },
  });
}
