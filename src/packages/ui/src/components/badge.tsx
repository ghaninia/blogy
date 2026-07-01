import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground elevated-primary',
        secondary: 'border-transparent bg-secondary text-secondary-foreground elevated-sm',
        outline: 'border-border bg-background text-foreground elevated-sm',
        destructive: 'border-transparent bg-destructive text-destructive-foreground border-b-destructive/80 shadow-[0_1px_0_hsl(var(--destructive)/0.6)]',
        success: 'border-transparent bg-success text-success-foreground elevated-sm',
        warning: 'border-transparent bg-warning text-warning-foreground elevated-primary',
        info: 'border-transparent bg-info text-info-foreground elevated-sm',
        glass: 'glass border-transparent text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
