"use client"

import { MDXProvider } from '@mdx-js/react';
import { ThemeProvider } from 'next-themes';

import mdxCustomComponents from '@/app/_components/mdx/custom-components';
import ColorAccentProvider from '@/app/_providers/ColorAccentProvider';
import FocusModeProvider from '@/app/_providers/FocusModeProvider';
import FramerMotionProvider from '@/app/_providers/FramerMotionProvider';
import GlobalStateProvider from '@/app/_providers/GlobalStateProvider';

import type { PropsWithChildren } from 'react';

function Provider({ children = null }: PropsWithChildren) {
  return (
    <FramerMotionProvider>
      <ThemeProvider attribute="class" disableTransitionOnChange>
        <FocusModeProvider>
          <ColorAccentProvider defaultScheme="violet">
            <GlobalStateProvider>
              <MDXProvider components={mdxCustomComponents}>
                {children}
              </MDXProvider>
            </GlobalStateProvider>
          </ColorAccentProvider>
        </FocusModeProvider>
      </ThemeProvider>
    </FramerMotionProvider>
  );
}

export default Provider;
