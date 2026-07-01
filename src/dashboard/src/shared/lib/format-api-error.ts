import { ApiError } from '@/shared/api-client';

export function formatApiError(err: unknown): string | undefined {
  if (!(err instanceof ApiError)) {
    return err instanceof Error ? err.message : undefined;
  }

  const details = err.details as { fieldErrors?: Record<string, string[]> } | undefined;
  const fieldErrors = details?.fieldErrors;
  if (fieldErrors && Object.keys(fieldErrors).length > 0) {
    return Object.entries(fieldErrors)
      .flatMap(([field, messages]) => messages.map((msg) => `${field}: ${msg}`))
      .join(' · ');
  }

  return err.message;
}
