import './main.css';

import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';
import QuickAccess from '@/components/QuickAccess';
import Shortcuts from '@/components/Shortcuts';
import Toaster from '@/components/Toaster';
import type { Metadata } from 'next';
import Provider from '@/app/_lib/providers';
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
    <html>
      <body
        id="__root"
        className={clsx([jetbrainsMono.variable, plusJakartaSans.variable])}
      >
        <div id="skip-navigation" />

        <Provider>
          <QuickAccess />
          <Shortcuts />
          <Navigation />
          <main className="top-18">{children}</main>
          <Toaster />
          <Footer />
        </Provider>
        <GoogleAnalytics gaId="" />
      </body>
    </html>
  );
}
