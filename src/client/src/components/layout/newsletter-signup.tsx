'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function NewsletterSignup() {
  const t = useTranslations('newsletter');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!consent || state === 'submitting') return;
    setState('submitting');
    try {
      const response = await fetch(`${API_URL}/api/subscribers/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, consent }),
      });
      if (!response.ok) throw new Error('Subscription failed');
      setState('success');
      setEmail('');
    } catch {
      setState('error');
    }
  };

  return (
    <section
      className="rounded-2xl border border-border bg-card/60 p-5 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-6"
      aria-labelledby="newsletter-signup-title"
    >
      <div className="max-w-lg">
        <h2 id="newsletter-signup-title" className="text-base font-semibold">
          {t('title')}
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{t('description')}</p>
      </div>
      <form onSubmit={submit} className="mt-4 w-full max-w-md space-y-3 sm:mt-0">
        <div className="flex gap-2">
          <input
            type="email"
            autoComplete="email"
            required
            maxLength={320}
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (state !== 'idle') setState('idle');
            }}
            placeholder={t('emailPlaceholder')}
            aria-label={t('emailLabel')}
            className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-primary"
          />
          <button
            type="submit"
            disabled={!consent || state === 'submitting'}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {state === 'submitting' ? t('submitting') : t('submit')}
          </button>
        </div>
        <label className="flex cursor-pointer items-start gap-2 text-xs leading-5 text-muted-foreground">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            required
            className="mt-1 h-4 w-4 shrink-0 accent-primary"
          />
          <span>{t('consent')}</span>
        </label>
        <p
          role={state === 'error' ? 'alert' : 'status'}
          aria-live="polite"
          className="min-h-5 text-xs text-muted-foreground"
        >
          {state === 'success' ? t('success') : state === 'error' ? t('error') : ''}
        </p>
      </form>
    </section>
  );
}
