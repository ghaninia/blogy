import { Geist, Geist_Mono } from 'next/font/google';
import localFont from 'next/font/local';

export const geistSans = Geist({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

export const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const vazirmatn = localFont({
  src: [
    {
      path: '../../public/fonts/vazirmatn/Vazirmatn-Thin.ttf',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../../public/fonts/vazirmatn/Vazirmatn-ExtraLight.ttf',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../../public/fonts/vazirmatn/Vazirmatn-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/vazirmatn/Vazirmatn-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/vazirmatn/Vazirmatn-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/vazirmatn/Vazirmatn-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/vazirmatn/Vazirmatn-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/vazirmatn/Vazirmatn-ExtraBold.ttf',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../../public/fonts/vazirmatn/Vazirmatn-Black.ttf',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-vazirmatn',
  display: 'swap',
  preload: true,
  fallback: ['Tahoma', 'Arial', 'sans-serif'],
});
