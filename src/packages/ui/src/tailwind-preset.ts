import type { Config } from 'tailwindcss';
import { radiusTokens } from './tokens/radius';
import { spacingTokens } from './tokens/spacing';
import { typographyTokens } from './tokens/typography';

const preset: Partial<Config> = {
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          border: 'hsl(var(--primary-border))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: 'hsl(var(--info-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        glass: {
          DEFAULT: 'hsl(var(--glass-bg))',
          border: 'hsl(var(--glass-border))',
          highlight: 'hsl(var(--glass-highlight))',
        },
      },
      borderRadius: {
        lg: radiusTokens.lg,
        md: radiusTokens.md,
        sm: radiusTokens.sm,
        xl: radiusTokens.xl,
      },
      fontFamily: {
        sans: typographyTokens.fontSans.split(', '),
        fa: typographyTokens.fontFa.split(', '),
        vazirmatn: typographyTokens.fontFa.split(', '),
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      },
      spacing: {
        sidebar: spacingTokens.sidebar,
        header: spacingTokens.header,
      },
      maxWidth: {
        container: spacingTokens.container,
      },
      boxShadow: {
        glass: '0 4px 24px -4px hsl(0 0% 0% / 0.08), inset 0 1px 0 0 hsl(var(--glass-highlight))',
        'glass-lg': '0 8px 32px -8px hsl(0 0% 0% / 0.15), inset 0 1px 0 0 hsl(var(--glass-highlight))',
      },
      backdropBlur: {
        glass: 'var(--glass-blur)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'fade-out': { from: { opacity: '1' }, to: { opacity: '0' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-out': 'fade-out 0.15s ease-in',
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
};

export default preset;
