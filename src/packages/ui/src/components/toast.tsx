'use client';

import { X } from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import { cn } from '../lib/cn';

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 5000;

export type ToastVariant = 'default' | 'destructive' | 'success' | 'warning' | 'info';

export interface Toast {
  id: string;
  title?: ReactNode;
  description?: ReactNode;
  variant?: ToastVariant;
  duration?: number;
}

type ToastAction =
  | { type: 'ADD'; toast: Toast }
  | { type: 'DISMISS'; id: string }
  | { type: 'REMOVE'; id: string };

interface ToastState {
  toasts: Toast[];
}

function toastReducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case 'ADD':
      return { toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT) };
    case 'DISMISS':
      return { toasts: state.toasts.filter((t) => t.id !== action.id) };
    case 'REMOVE':
      return { toasts: state.toasts.filter((t) => t.id !== action.id) };
    default:
      return state;
  }
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (props: Omit<Toast, 'id'>) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let toastCount = 0;

function genId() {
  toastCount = (toastCount + 1) % Number.MAX_SAFE_INTEGER;
  return toastCount.toString();
}

const variantClasses: Record<ToastVariant, string> = {
  default: 'border-border bg-background text-foreground',
  destructive: 'border-destructive/50 bg-destructive text-destructive-foreground',
  success: 'border-success/50 bg-success text-success-foreground',
  warning: 'border-warning/50 bg-warning text-warning-foreground',
  info: 'border-info/50 bg-info text-info-foreground',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(toastReducer, { toasts: [] });
  const timeouts = useMemo(() => new Map<string, ReturnType<typeof setTimeout>>(), []);

  const dismiss = useCallback(
    (id: string) => {
      dispatch({ type: 'DISMISS', id });
      const existing = timeouts.get(id);
      if (existing) clearTimeout(existing);
      const timeout = setTimeout(() => dispatch({ type: 'REMOVE', id }), 300);
      timeouts.set(id, timeout);
    },
    [timeouts],
  );

  const toast = useCallback(
    (props: Omit<Toast, 'id'>) => {
      const id = genId();
      dispatch({ type: 'ADD', toast: { ...props, id } });
      const duration = props.duration ?? TOAST_REMOVE_DELAY;
      if (duration > 0) {
        const timeout = setTimeout(() => dismiss(id), duration);
        timeouts.set(id, timeout);
      }
      return id;
    },
    [dismiss, timeouts],
  );

  const value = useMemo(() => ({ toasts: state.toasts, toast, dismiss }), [state.toasts, toast, dismiss]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function Toaster({ className }: { className?: string }) {
  const { toasts, dismiss } = useToast();

  return (
    <div
      className={cn(
        'pointer-events-none fixed bottom-0 end-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-[420px]',
        className,
      )}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            'pointer-events-auto flex w-full items-start gap-3 rounded-lg border p-4 shadow-lg animate-fade-in',
            variantClasses[t.variant ?? 'default'],
          )}
        >
          <div className="grid flex-1 gap-1">
            {t.title ? <div className="text-sm font-semibold">{t.title}</div> : null}
            {t.description ? <div className="text-sm opacity-90">{t.description}</div> : null}
          </div>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <X className="size-4" />
            <span className="sr-only">Dismiss</span>
          </button>
        </div>
      ))}
    </div>
  );
}
