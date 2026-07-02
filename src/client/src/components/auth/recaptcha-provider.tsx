'use client';

import {
  createContext,
  useCallback,
  useContext,
  type ReactNode,
} from 'react';
import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from 'react-google-recaptcha-v3';

const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? '';

interface RecaptchaContextValue {
  getToken: (action?: string) => Promise<string>;
}

const RecaptchaContext = createContext<RecaptchaContextValue | null>(null);

const bypassContext: RecaptchaContextValue = {
  getToken: async () => 'dev-bypass-token',
};

function RecaptchaBridge({ children }: { children: ReactNode }) {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const getToken = useCallback(
    async (action = 'submit') => {
      if (!executeRecaptcha) return 'dev-bypass-token';
      return executeRecaptcha(action);
    },
    [executeRecaptcha],
  );

  return (
    <RecaptchaContext.Provider value={{ getToken }}>{children}</RecaptchaContext.Provider>
  );
}

export function RecaptchaProvider({ children }: { children: ReactNode }) {
  if (!siteKey) {
    return (
      <RecaptchaContext.Provider value={bypassContext}>{children}</RecaptchaContext.Provider>
    );
  }

  return (
    <GoogleReCaptchaProvider reCaptchaKey={siteKey} scriptProps={{ async: true, defer: true }}>
      <RecaptchaBridge>{children}</RecaptchaBridge>
    </GoogleReCaptchaProvider>
  );
}

export function useRecaptcha(): RecaptchaContextValue {
  const context = useContext(RecaptchaContext);
  if (!context) {
    throw new Error('useRecaptcha must be used within RecaptchaProvider');
  }
  return context;
}
