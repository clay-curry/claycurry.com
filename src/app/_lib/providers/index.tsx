"use client"

import { SWRConfig } from 'swr';
import { MDXProvider } from '@mdx-js/react';
import { ThemeProvider } from 'next-themes';

import FocusModeProvider from '@/app/_lib/providers/FocusModeProvider';
import ColorAccentProvider from '@/app/_lib/providers/ColorAccentProvider';
import GlobalStateProvider from '@/app/_lib/providers/GlobalStateProvider';
import FramerMotionProvider from '@/app/_lib/providers/FramerMotionProvider';
import mdxCustomComponents from '@/app/_lib/components/mdx/custom-components';

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