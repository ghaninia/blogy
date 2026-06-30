import { cn } from '../lib/cn';
import { Label, type LabelProps } from './label';

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  labelProps?: LabelProps;
  htmlFor?: string;
  error?: React.ReactNode;
  required?: boolean;
}

export function FormField({
  className,
  label,
  labelProps,
  htmlFor,
  error,
  required,
  children,
  ...props
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {label ? (
        <Label htmlFor={htmlFor} {...labelProps}>
          {label}
          {required ? <span className="text-destructive"> *</span> : null}
        </Label>
      ) : null}
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
