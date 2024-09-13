

import './main.css';
import type { Metadata } from 'next';
import Provider from './_providers';
import { GoogleAnalytics } from '@next/third-parties/google';

import RootLayout from './_components/layouts/Root';
import WithNavigationFooter from './_components/layouts/WithNavigationFooter';
import { ReactElement, ReactNode } from 'react';
import { cookies, headers } from 'next/headers';
import { encrypt } from './_lib/session';




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



export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html>
      <body>
        <div id="skip-navigation" />

        <Provider>
        <RootLayout>

          <WithNavigationFooter>
            {children}
          </WithNavigationFooter>

          <GoogleAnalytics gaId='' />
        </RootLayout>
      </Provider>
      </body>
    </html>
  );
}
