// ─── Upload Page ────────────────────────────────────────────────────────────
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Link as LinkIcon, CheckCircle2, Circle } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useUpload } from '@/hooks/useUpload';
import { useAnalysis } from '@/hooks/useAnalysis';
import { buildRoute, ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function UploadPage() {
  const navigate = useNavigate();
  const { upload, ingestXbrl, progress, streamData, isUploading, data, error, reset } = useUpload();
  const { data: analysis } = useAnalysis(data?.analysisId ?? null);
  const [xbrlUrl, setXbrlUrl] = useState('');

  const onDrop = useCallback((files: File[]) => { if (files[0]) upload(files[0]); }, [upload]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: isUploading,
  });

  useEffect(() => {
    if (analysis?.status === 'COMPLETED' && data?.analysisId) {
      setTimeout(() => navigate(buildRoute(ROUTES.DASHBOARD, { analysisId: data.analysisId })), 800);
    }
  }, [analysis?.status, data?.analysisId, navigate]);

  const handleXbrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (xbrlUrl.trim()) {
      ingestXbrl(xbrlUrl.trim());
    }
  };

  const isProcessing = isUploading || (data && analysis?.status !== 'COMPLETED' && analysis?.status !== 'FAILED');

  // Helper to determine step status
  const getStepStatus = (targetStep: string, currentStep: string | undefined) => {
    if (currentStep === 'COMPLETED') return 'done';
    const steps = ['VALIDATING', 'DOWNLOADING', 'PARSING', 'EXTRACTING', 'MAPPING', 'NORMALIZING', 'SCORING'];
    const targetIdx = steps.indexOf(targetStep);
    const currentIdx = steps.indexOf(currentStep ?? '');
    
    if (currentIdx > targetIdx) return 'done';
    if (currentIdx === targetIdx) return 'active';
    return 'pending';
  };

  return (
    <PageShell title="Ingest BRSR Report" description="Upload a BRSR PDF or provide an XBRL link for automated SRMM analysis.">
      <motion.div 
        className="max-w-4xl mx-auto py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence mode="wait">
          {!isProcessing && !error && (
            <motion.div 
              key="input-selection"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {/* PDF Upload Card */}
              <div
                {...getRootProps()}
                className={cn(
                  'flex flex-col items-center justify-center p-12 rounded-3xl border-2 border-dashed cursor-pointer transition-all duration-300 relative overflow-hidden bg-card/50 backdrop-blur-xl shadow-lg',
                  isDragActive ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-border hover:border-primary/50 hover:bg-muted/50',
                )}
              >
                {isDragActive && (
                  <motion.div 
                    className="absolute inset-0 bg-primary/5 pointer-events-none"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
                <input {...getInputProps()} id="pdf-upload-input" />
                <motion.div animate={isDragActive ? { y: -10 } : { y: 0 }}>
                  <Upload className={cn('w-16 h-16 mb-6 transition-colors', isDragActive ? 'text-primary' : 'text-muted-foreground')} />
                </motion.div>
                <p className="font-semibold text-lg mb-2">{isDragActive ? 'Drop PDF here' : 'Upload BRSR PDF'}</p>
                <p className="text-sm text-muted-foreground text-center">Drag & drop or <span className="text-primary font-medium hover:underline">browse</span></p>
              </div>

              {/* XBRL URL Card */}
              <div className="flex flex-col items-center justify-center p-12 rounded-3xl border-2 border-border transition-all duration-300 bg-card/50 backdrop-blur-xl shadow-lg hover:border-primary/50">
                <LinkIcon className="w-16 h-16 mb-6 text-muted-foreground" />
                <p className="font-semibold text-lg mb-4">Analyze via XBRL Link</p>
                <form onSubmit={handleXbrlSubmit} className="w-full flex flex-col gap-3">
                  <input 
                    type="url" 
                    placeholder="https://example.com/report.xbrl" 
                    value={xbrlUrl}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setXbrlUrl(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <Button type="submit" className="w-full" disabled={!xbrlUrl}>Fetch & Analyze</Button>
                </form>
              </div>
            </motion.div>
          )}

          {isProcessing && (
            <motion.div 
              key="processing-tracker"
              className="max-w-2xl mx-auto bg-card/50 backdrop-blur-xl border rounded-3xl shadow-lg p-10 space-y-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="text-center space-y-4">
                <div className="relative w-16 h-16 mx-auto">
                  <motion.div 
                    className="absolute inset-0 border-4 border-primary/30 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  <FileText className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <h3 className="text-xl font-semibold">Processing Document</h3>
                {streamData?.message && (
                  <p className="text-muted-foreground">{streamData.message}</p>
                )}
                {!streamData && progress > 0 && (
                  <Progress value={progress} className="h-2 w-full bg-muted overflow-hidden" />
                )}
                {streamData && (
                  <Progress value={streamData.progressPercentage} className="h-2 w-full bg-muted overflow-hidden" />
                )}
              </div>

              {/* Vertical Step Tracker */}
              {streamData && (
                <div className="space-y-4 pt-4 border-t border-border">
                  {[
                    { id: 'VALIDATING', label: 'Validating Input' },
                    { id: 'DOWNLOADING', label: 'Downloading Document' },
                    { id: 'PARSING', label: 'Parsing Structures' },
                    { id: 'EXTRACTING', label: 'Extracting Data (PDF)' },
                    { id: 'MAPPING', label: 'Mapping Taxonomy (XBRL)' },
                    { id: 'NORMALIZING', label: 'Normalizing Schema' },
                    { id: 'SCORING', label: 'Calculating SRMM Score' },
                  ].map((step) => {
                    const status = getStepStatus(step.id, streamData.step);
                    // Hide steps that aren't applicable (e.g. MAPPING for PDF)
                    if (status === 'pending' && streamData.progressPercentage > 80) return null;

                    return (
                      <div key={step.id} className="flex items-center gap-4">
                        {status === 'done' ? (
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        ) : status === 'active' ? (
                          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                            <Circle className="w-6 h-6 text-primary fill-primary/20" />
                          </motion.div>
                        ) : (
                          <Circle className="w-6 h-6 text-muted" />
                        )}
                        <span className={cn(
                          "font-medium", 
                          status === 'done' ? 'text-foreground' : status === 'active' ? 'text-primary' : 'text-muted-foreground'
                        )}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {analysis?.status === 'COMPLETED' && (
            <motion.div 
              key="completed"
              className="text-center space-y-3 py-12 bg-card/50 backdrop-blur-xl border rounded-3xl shadow-lg max-w-xl mx-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500 text-3xl font-bold">
                ✓
              </div>
              <p className="text-xl font-semibold text-green-600 dark:text-green-400">Analysis Complete!</p>
              <p className="text-sm text-muted-foreground">Redirecting you to the dashboard...</p>
            </motion.div>
          )}

          {(error || analysis?.status === 'FAILED') && (
            <motion.div 
              key="error"
              className="text-center space-y-6 py-12 bg-card/50 backdrop-blur-xl border rounded-3xl shadow-lg max-w-xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="p-4 bg-destructive/10 rounded-lg inline-block">
                <p className="text-destructive font-medium">{error?.message ?? analysis?.errorMessage ?? streamData?.message ?? 'Processing failed. Please check the input.'}</p>
              </div>
              <div>
                <Button size="lg" variant="outline" onClick={reset}>Try Another File</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </PageShell>
  );
}
