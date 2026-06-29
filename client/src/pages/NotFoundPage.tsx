import { Link } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { SearchX } from 'lucide-react';

export function NotFoundPage() {
  return (
    <PageShell title="Page Not Found">
      <motion.div 
        className="flex flex-col items-center justify-center py-24 text-center space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="bg-muted p-6 rounded-full inline-block">
          <SearchX className="w-16 h-16 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">404 - Not Found</h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <Button asChild size="lg" className="mt-4">
          <Link to="/">Return to Home</Link>
        </Button>
      </motion.div>
    </PageShell>
  );
}
