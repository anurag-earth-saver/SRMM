// ─── useUpload Hook ─────────────────────────────────────────────────────────
import { useState, useCallback, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { analysisApi } from '@/services/analysisApi';
import type { UploadResponse } from '@brsr-srmm/shared';

// Type for the SSE events
export interface StreamProgress {
  step: string;
  progressPercentage: number;
  message: string;
}

export function useUpload() {
  const [progress, setProgress] = useState(0);
  const [streamData, setStreamData] = useState<StreamProgress | null>(null);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => analysisApi.upload(file, setProgress),
  });

  const xbrlMutation = useMutation({
    mutationFn: (url: string) => analysisApi.ingestXbrl(url),
  });

  const upload = useCallback((file: File) => { setProgress(0); setStreamData(null); uploadMutation.mutate(file); }, [uploadMutation]);
  const ingestXbrl = useCallback((url: string) => { setProgress(0); setStreamData(null); xbrlMutation.mutate(url); }, [xbrlMutation]);
  
  const reset = useCallback(() => { 
    setProgress(0); 
    setStreamData(null);
    uploadMutation.reset(); 
    xbrlMutation.reset();
  }, [uploadMutation, xbrlMutation]);

  const activeMutation = uploadMutation.isPending || uploadMutation.data ? uploadMutation : xbrlMutation;
  const analysisId = activeMutation.data?.analysisId;

  // Listen to SSE if we have an analysisId
  useEffect(() => {
    if (!analysisId) return;

    const eventSource = new EventSource(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/analysis/${analysisId}/stream`);

    eventSource.onmessage = (event) => {
      try {
        const data: StreamProgress = JSON.parse(event.data);
        setStreamData(data);
        if (data.step === 'COMPLETED' || data.step === 'FAILED') {
          eventSource.close();
        }
      } catch (e) {
        console.error('Failed to parse SSE message', e);
      }
    };

    return () => eventSource.close();
  }, [analysisId]);

  return {
    upload,
    ingestXbrl,
    progress, // Raw file upload progress (0-100)
    streamData, // SSE step-by-step progress
    isUploading: uploadMutation.isPending || xbrlMutation.isPending,
    data: activeMutation.data as UploadResponse | undefined,
    error: activeMutation.error,
    reset,
  };
}
