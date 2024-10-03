"use client"

import { SWRConfig } from 'swr';
import { MDXProvider } from '@mdx-js/react';
import { ThemeProvider } from 'next-themes';

import FocusModeProvider from '@/providers/FocusModeProvider';
import ColorAccentProvider from '@/providers/ColorAccentProvider';
import GlobalStateProvider from '@/providers/GlobalStateProvider';
import FramerMotionProvider from '@/providers/FramerMotionProvider';
import mdxCustomComponents from '@/components/mdx/custom-components';

import type { PropsWithChildren } from 'react';

function Provider({ children = null }: PropsWithChildren) {
  return (
    <SWRConfig
      value={{
        fetcher: (url: string) => fetch(url).then((res) => res.json()),
      }}
    >
      <MDXProvider components={mdxCustomComponents}>
        <ThemeProvider attribute="class" disableTransitionOnChange>
          <ColorAccentProvider defaultScheme="violet">
            <GlobalStateProvider>
              <FramerMotionProvider>
                <FocusModeProvider>
                  {children as React.ReactElement}
                </FocusModeProvider>
              </FramerMotionProvider>
            </GlobalStateProvider>
          </ColorAccentProvider>
        </ThemeProvider>
      </MDXProvider>
    </SWRConfig>
  );
}

export default Provider;
