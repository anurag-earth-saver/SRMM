// ─── Page Shell ─────────────────────────────────────────────────────────────
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PageShellProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function PageShell({ title, description, children }: PageShellProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 p-6 lg:p-8"
    >
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)]">{title}</h1>
        {description && <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{description}</p>}
      </div>
      {children}
    </motion.div>
  );
}
