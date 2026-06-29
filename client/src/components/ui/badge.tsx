// ─── shadcn/ui Badge ────────────────────────────────────────────────────────
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-[var(--color-primary)] text-white',
        secondary: 'border-transparent bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]',
        outline: 'text-[hsl(var(--foreground))]',
        success: 'border-transparent bg-emerald-500/10 text-emerald-500',
        warning: 'border-transparent bg-amber-500/10 text-amber-500',
        destructive: 'border-transparent bg-red-500/10 text-red-500',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
