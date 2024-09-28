"use client"


import { HashtagIcon } from '@/components/Icons';
import NextLink from 'next/link';

import { ExternalLink, MailIcon } from '@/components/Icons';

import slug from 'slug';
import { ReactNode } from 'react';
/* eslint-disable react/no-array-index-key */
import { Tab } from '@headlessui/react';
import { Children } from 'react';


import clsx from 'clsx';

import type { DetailedHTMLProps, HTMLAttributes } from 'react';


import type { MDXComponents } from 'mdx/types';

import { NpmIcon, PnpmIcon, YarnIcon } from '@/components/Icons';
import {
  CssIcon,
  FileIcon,
  HtmlIcon,
  JavaScriptIcon,
  NpmFileIcon,
  ReactIcon,
  TailwindIcon,
  TypeScriptIcon,
} from '@/components/IconsFile';

import type { AnchorHTMLAttributes, ReactElement } from 'react';

import { PropsWithChildren, useRef, useState } from 'react';

import { ClipboardIcon } from '@/components/Icons';

const getSlug = (children: ReactNode) => {
  if (typeof children === 'string') {
    return slug(children);
  }

  return '';
};

type Props = DetailedHTMLProps<
  HTMLAttributes<HTMLHeadingElement>,
  HTMLHeadingElement
>;

export function H2({ children }: Props) {
  const slug = getSlug(children);

  return (
    <h2
      id={slug}
      data-ss={slug}
      data-ss-mt={96}
      className={clsx('mdx-heading mdx-heading--h2 group')}
    >
      <a
        href={`#${slug}`}
        className={clsx('mdx-heading__anchor group-hover:opacity-100')}
        aria-labelledby={slug}
        title={`Link to ${children}`}
      >
        <HashtagIcon />
      </a>
      <span>{children}</span>
    </h2>
  );
}

export function H3({ children }: Props) {
  const slug = getSlug(children);

  return (
    <h3
      id={slug}
      data-ss={slug}
      data-ss-mt={96}
      className={clsx('mdx-heading mdx-heading--h3 group')}
    >
      <a
        href={`#${slug}`}
        className={clsx('mdx-heading__anchor group-hover:opacity-100')}
        aria-labelledby={slug}
      >
        <HashtagIcon />
      </a>
      <span>{children}</span>
    </h3>
  );
}

export function Hr() {
  return <hr className={clsx('mdx-hr')} />;
}

export function Link({ children, href }: DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>) {
  if (!href) {
    return <span>{children}</span>;
  }
  const urlType = (url: string) => {
    if (['/'].includes(url[0])) {
      return 'internal';
    }

    if (['#'].includes(url[0])) {
      return 'hash';
    }

    if (url.indexOf('mailto') === 0) {
      return 'mail';
    }

    return 'external';
  };
  const type = urlType(href);

  switch (type) {
    case 'external':
      return (
        <a
          href={href}
          target="_blank"
          rel="noreferrer nofollow"
          className={clsx('link')}
        >
          {children}
          <ExternalLink />
        </a>
      );
    case 'mail':
      return (
        <a href={href} className={clsx('link')}>
          <MailIcon />
          {children}
        </a>
      );
    case 'hash':
      return (
        <a href={href} className={clsx('link')}>
          {children}
        </a>
      );
    default:
      return (
        <NextLink href={href} className={clsx('link')}>
          {children}
        </NextLink>
      );
  }
}

function CodeFooter({
  lines = 0,
  language = '',
  selected = '',
}: {
  lines?: number;
  language?: string;
  selected?: string;
}) {
  return (
    <div className={clsx('mdx-code__footer')}>
      {selected && (
        <div className={clsx('mdx-code__footer-item')}>
          Selected: {selected}
        </div>
      )}
      {language && (
        <div className={clsx('mdx-code__footer-item')}>{language}</div>
      )}
      {lines && (
        <div className={clsx('mdx-code__footer-item hidden', 'sm:flex')}>
          Lines: {lines}
        </div>
      )}
      <div className={clsx('mdx-code__footer-item')}>UTF-8</div>
    </div>
  );
}

function Code({
  lines = 0,
  language = '',
  selected = '',
  withCopyButton = true,
  withFooter = true,
  children = null,
}: PropsWithChildren<{
  lines?: number;
  language?: string;
  selected?: string;
  withCopyButton?: boolean;
  withFooter?: boolean;
}>) {
  const codeRef = useRef<HTMLPreElement>(null);
  const [isCopied, setCopied] = useState<boolean>(false);

  const copyToClipboard = async () => {
    try {
      const content = codeRef?.current?.textContent || '';
      await navigator.clipboard.writeText(content);

      if (!isCopied) {
        setCopied(true);
        setTimeout(() => setCopied(false), 1000);
      }
    } catch (err) {
      setCopied(false);
    }
  };

  return (
    <div className={clsx('mdx-code')}>
      {withCopyButton && (
        <button
          type="button"
          className={clsx('mdx-code__copy-button')}
          onClick={copyToClipboard}
          title="Copy to Clipboard"
          aria-label="Copy to Clipboard"
        >
          <div
            className={clsx('mdx-code__copy-button-message', [
              isCopied ? 'mdx-code__copy-button-message-copied' : '',
            ])}
          >
            Copied!
          </div>
          <ClipboardIcon />
        </button>
      )}
      <div className={clsx('mdx-code__content')}>
        <pre ref={codeRef}>{children}</pre>
      </div>
      {withFooter && (
        <CodeFooter lines={lines} selected={selected} language={language} />
      )}
    </div>
  );
}


export const formatLang = (
  lang: string,
  title?: string
): {
  language: string;
  icon: ReactElement;
} => {
  let language = lang;
  let icon = <FileIcon />;

  switch (lang) {
    case 'js':
    case 'javascript':
      language = 'JavaScript';
      icon = <JavaScriptIcon />;
      break;
    case 'ts':
    case 'typescript':
      language = 'TypeScript';
      icon = <TypeScriptIcon />;
      break;
    case 'jsx':
      language = 'JavaScript React';
      icon = <ReactIcon />;
      break;
    case 'tsx':
      language = 'TypeScript React';
      icon = <ReactIcon />;
      break;
    case 'html':
      language = 'HTML';
      icon = <HtmlIcon />;
      break;
    case 'css':
      language = 'CSS';
      icon = <CssIcon />;
      break;
    case 'bash':
    case 'cmd':
      language = 'Terminal';
      break;
    case 'json':
      language = 'JSON';
      break;
    case '':
      language = 'Plain Text';
      break;
    default:
      break;
  }

  switch (title) {
    case 'tailwind.config.js':
      icon = <TailwindIcon />;
      break;
    case 'package.json':
      icon = <NpmFileIcon />;
      break;
    case 'npm':
      icon = <NpmIcon />;
      break;
    case 'pnpm':
      icon = <PnpmIcon />;
      break;
    case 'yarn':
      icon = <YarnIcon />;
      break;
    default:
      break;
  }

  return { language, icon };
};


const parseBoolean = (value: string): boolean => {
  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return true;
};

export type PreProps = DetailedHTMLProps<
  HTMLAttributes<HTMLPreElement>,
  HTMLPreElement
> & {
  'data-title'?: string;
  'data-lines'?: string;
  'data-selected'?: string;
  'data-language'?: string;
  'data-copy'?: string;
  'data-footer'?: string;
};

export function Pre({
  children,
  'data-title': dataTitle = '',
  'data-lines': dataLines = '',
  'data-selected': dataSelected = '',
  'data-language': dataLanguage = '',
  'data-copy': dataCopy = 'true',
  'data-footer': dataFooter = undefined,
}: PreProps) {
  const title = dataTitle;
  const lines = Number(dataLines);
  const selected = dataSelected;
  const { language } = formatLang(dataLanguage, title);
  const copy = parseBoolean(dataCopy);

  let withFooter = lines > 1;

  if (typeof dataFooter !== 'undefined') {
    withFooter = parseBoolean(dataFooter);
  }

  return (
    <Code
      withFooter={withFooter}
      withCopyButton={copy}
      lines={Number(lines)}
      selected={selected}
      language={language}
    >
      {children}
    </Code>
  );
}

function CodeGroupFile({ children = null }: PropsWithChildren) {
  return (
    <Tab className={clsx('mdx-code-group__file')}>
      {({ selected }) => (
        <div className={clsx('mdx-code-group__file-content')}>
          {selected && (
            <>
              <div className={clsx('mdx-code-group__file-bl')} />
              <div className={clsx('mdx-code-group__file-br')} />
            </>
          )}
          {children}
        </div>
      )}
    </Tab>
  );
}

function CodeGroupTab({ children = null }: PropsWithChildren) {
  return <Tab className={clsx('mdx-code-group__tab')}>{children}</Tab>;
}

interface CodeGroupProps {
  children: ReactElement<PreProps> | ReactElement<PreProps>[];
  variant?: 'tab' | 'files';
}

function CodeGroup({ variant = 'tab', children }: CodeGroupProps) {
  const tab: Array<{
    icon: ReactElement;
    title: string;
    panel: ReactElement<PreProps>;
  }> = [];

  Children.forEach(children, (child) => {
    if (child.type === Pre) {
      const title = child.props['data-title'] || '';
      const language = child.props['data-language'] || '';

      const { icon } = formatLang(language, title);

      tab.push({
        icon,
        title,
        panel: child,
      });
    }
  });

  return (
    <div
      className={clsx('mdx-code-group', [
        variant === 'tab' ? 'mdx-code-group--tab' : 'mdx-code-group--files',
      ])}
    >
      <Tab.Group manual>
        <div className={clsx('mdx-code-group__header-wrapper')}>
          <Tab.List className={clsx('mdx-code-group__header')}>
            {tab.map(({ title, icon }, idx) =>
              variant === 'tab' ? (
                <CodeGroupTab key={idx}>
                  {icon}
                  {title}
                </CodeGroupTab>
              ) : (
                <CodeGroupFile key={idx}>
                  {icon}
                  {title}
                </CodeGroupFile>
              )
            )}
          </Tab.List>
        </div>
        <Tab.Panels className={clsx('mdx-code-group__content')}>
          {tab.map(({ panel }, idx) => (
            <Tab.Panel key={idx}>{panel}</Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}

export function Table({ children }: DetailedHTMLProps<
  HTMLAttributes<HTMLTableElement>,
  HTMLTableElement
>) {
  return (
    <div className={clsx('mdx-table')}>
      <table>{children}</table>
    </div>
  );
}

const CustomComponents = {
  a: Link,
  h2: H2,
  h3: H3,
  hr: Hr,
  pre: Pre,
  table: Table,
}

export default CustomComponents;