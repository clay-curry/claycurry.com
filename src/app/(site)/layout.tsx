
import Footer from '@/app/(site)/Footer';
import Navigation from '@/app/(site)/Navigation';
import QuickAccess from '@/app/(site)/QuickAccess';
import Toaster from '@/app/(site)/Toaster';
import type { Metadata } from 'next';
import Provider from '@/providers';
import { GoogleAnalytics } from '@next/third-parties/google';

import clsx from 'clsx';

import {
  JetBrains_Mono as JetBrainsMono,
  Plus_Jakarta_Sans as PlusJakartaSans,
} from 'next/font/google';
const jetbrainsMono = JetBrainsMono({
  subsets: ['latin'],
  variable: '--font-mono',
});
const plusJakartaSans = PlusJakartaSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://claycurry.com'),
  title: {
    default: 'Clayton Curry',
    template: '%s | Clayton Curry',
  },
  description: 'Developer, writer, and creator.',
  openGraph: {
    title: 'Clayton Curry',
    description: 'Developer, writer, and creator.',
    url: 'https://claycurry.com',
    siteName: 'Clayton Curry',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: {
    title: 'Clayton Curry',
    card: 'summary_large_image',
  },
  verification: {
    google: '',
    yandex: '',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (


    <body
      className={clsx(
        'h-full',
        'bg-white dark:bg-slate-900',
        'text-slate-900 dark:text-slate-200 dark:[color-scheme:dark]',
        'flex flex-col',
        'font-sans',
        [jetbrainsMono.variable, plusJakartaSans.variable]
      )}
    >
      <Provider>
        <QuickAccess />
        <Navigation />
        {children}
        <Toaster />
        <Footer />
        <GoogleAnalytics gaId="" />
      </Provider>
      
    </body>
  );
}
