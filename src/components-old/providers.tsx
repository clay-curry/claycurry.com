import { MDXProvider } from '@mdx-js/react';
import { ThemeProvider } from 'next-themes';


import useFocusMode from '@/app/_hooks/useFocusMode';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { H2, H3 } from './Heading';
import { Hr } from './Hr';
import { Link } from './Link';
import { Pre } from './Pre';
import { Table } from './Table';

import type { MDXComponents } from 'mdx/types';

import {
  domAnimation,
  LazyMotion,
  MotionConfig as MotionProvider,
} from 'framer-motion';

interface FramerMotionProviderProps {
  children: JSX.Element;
}

function FramerMotionProvider({ children }: FramerMotionProviderProps) {
  return (
    <MotionProvider reducedMotion="user">
      <LazyMotion strict features={domAnimation}>
        {children}
      </LazyMotion>
    </MotionProvider>
  );
}


const components: MDXComponents = {
  a: Link,
  h2: H2,
  h3: H3,
  hr: Hr,
  pre: Pre,
  table: Table,
};


interface ColorAccentProviderProps {
  defaultScheme?: 'violet' | 'blue';
  children: JSX.Element;
}

function ColorAccentProvider({
  defaultScheme = 'violet',
  children,
}: ColorAccentProviderProps) {
  const { pathname } = useRouter();

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', defaultScheme);

    if (pathname.includes('/work/')) {
      document.documentElement.setAttribute('data-accent', 'blue');
    }
  }, [pathname, defaultScheme]);

  return children;
}

interface FocusModeProviderProps {
  children: JSX.Element;
}

function FocusModeProvider({ children }: FocusModeProviderProps) {
  const { focusMode } = useFocusMode();

  useEffect(() => {
    if (focusMode) {
      document.documentElement.classList.add('fm');
    } else {
      document.documentElement.classList.remove('fm');
    }
  }, [focusMode]);

  return children;
}

import { createContext, useMemo, useState } from 'react';

interface GlobalContext {
  isQuickAccessOpen: boolean;
  setQuickAccessOpen: (value: boolean) => void;
}

const DEFAULT_VALUE: GlobalContext = {
  isQuickAccessOpen: false,
  setQuickAccessOpen: () => {},
};

const GlobalStateContext = createContext<GlobalContext>(DEFAULT_VALUE);

function GlobalStateProvider({ children }: { children: React.ReactNode }) {
  const [isQuickAccessOpen, setQuickAccessOpen] = useState<boolean>(
    DEFAULT_VALUE.isQuickAccessOpen
  );

  const value = useMemo(
    () => ({ isQuickAccessOpen, setQuickAccessOpen }),
    [isQuickAccessOpen]
  );

  return (
    <GlobalStateContext.Provider value={value}>
      {children}
    </GlobalStateContext.Provider>
  );
}

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
