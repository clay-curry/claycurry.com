"use server"

import Footer from '@/app/_components/Footer';
import Navigation from '@/app/_components/Navigation';
import QuickAccess from '@/app/_components/QuickAccess';
import Shortcuts from '@/app/_components/Shortcuts';
import Toaster from '@/app/_components/Toaster';

import type { PropsWithChildren } from 'react';

function WithNavigationFooter({ children }: PropsWithChildren) {
  return (
    <>
      <QuickAccess />
      <Shortcuts />
      <Navigation />
      <main>{children}</main>
      <Toaster />
      <Footer />
    </>
  );
}

export default WithNavigationFooter;
