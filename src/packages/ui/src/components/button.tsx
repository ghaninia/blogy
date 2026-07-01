import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground elevated-interactive-primary hover:brightness-105',
        secondary:
          'bg-secondary text-secondary-foreground border border-border elevated-interactive hover:bg-secondary/80',
        destructive:
          'bg-destructive text-destructive-foreground border-b-[3px] border-b-destructive/80 shadow-[0_2px_0_hsl(var(--destructive)/0.6)] active:translate-y-[2px] active:border-b active:shadow-none',
        outline:
          'border border-input bg-background elevated-interactive hover:bg-accent hover:text-accent-foreground',
        ghost:
          'hover:bg-accent hover:text-accent-foreground active:translate-y-px',
        soft: 'bg-accent text-accent-foreground elevated-sm hover:bg-accent/80',
        link: 'text-primary underline-offset-4 hover:underline font-medium',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-11 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
  ),
);
Button.displayName = 'Button';

export { buttonVariants };
