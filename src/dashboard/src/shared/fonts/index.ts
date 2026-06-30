import localFont from 'next/font/local';
import { Plus_Jakarta_Sans } from 'next/font/google';

export const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

export const iranSans = localFont({
  src: [
    {
      path: '../../../public/fonts/iransans/IRANSansWeb_UltraLight.woff2',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/iransans/IRANSansWeb_Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/iransans/IRANSansWeb.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/iransans/IRANSansWeb_Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/iransans/IRANSansWeb_Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-iransans',
  display: 'swap',
});
