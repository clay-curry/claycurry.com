"use client"


import { HashtagIcon } from '@/app/Icons';
import NextLink from 'next/link';

import { ExternalLink, MailIcon } from '@/app/Icons';

import slug from 'slug';
import { ReactNode } from 'react';
/* eslint-disable react/no-array-index-key */
import { Tab } from '@headlessui/react';
import { Children } from 'react';


import clsx from 'clsx';

import type { DetailedHTMLProps, HTMLAttributes } from 'react';


import type { MDXComponents } from 'mdx/types';

import { NpmIcon, PnpmIcon, YarnIcon } from '@/app/Icons';
import type { ComponentProps } from 'react';

export function JavaScriptIcon(props: ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 482.2 367.2"
      {...props}
    >
      <path
        d="m130.9 39.7h64.9v181.9c0 82-39.2 110.6-102 110.6-15.3 0-35-2.6-47.8-6.9l7.3-52.5c10.8 3.4 22 5.2 33.3 5.1 27.3 0 44.4-12.4 44.4-56.8 0 .1-.1-181.4-.1-181.4zm121.3 221.2c17.1 9 44.4 17.9 72.1 17.9 29.9 0 45.7-12.4 45.7-31.5 0-17.5-13.6-28.2-48.2-40.1-47.8-17.1-79.4-43.5-79.4-85.8 0-49.2 41.4-86.3 108.9-86.3 32.9 0 56.4 6.4 73.4 14.5l-14.5 52.1c-18.6-9.1-39.1-13.8-59.8-13.6-28.2 0-41.8 13.2-41.8 27.8 0 18.3 15.8 26.5 53.4 41 50.8 18.8 74.3 45.2 74.3 86.3 0 48.2-36.8 89.3-115.8 89.3-32.9 0-65.4-9-81.6-17.9z"
        fill="#f4bf75"
      />
    </svg>
  );
}

export function TypeScriptIcon(props: ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24.94 16.43"
      {...props}
    >
      <path
        d="M20.86.15a4.42 4.42 0 012.22 1.28 5.85 5.85 0 01.85 1.14s-1.53 1.08-2.46 1.66c0 0-.17-.12-.32-.35a2 2 0 00-1.67-1c-1.08-.07-1.77.49-1.77 1.43a1.3 1.3 0 00.15.67c.24.49.68.78 2.06 1.38 2.54 1.1 3.64 1.82 4.31 2.84a5.16 5.16 0 01.42 4.33 4.76 4.76 0 01-3.93 2.82 10.9 10.9 0 01-2.71 0 6.53 6.53 0 01-3.62-1.88 6.28 6.28 0 01-.93-1.37 2.65 2.65 0 01.33-.21l1.32-.76 1-.6.21.31a4.77 4.77 0 001.35 1.29 3.3 3.3 0 003.46-.17 1.55 1.55 0 00.2-2c-.28-.4-.84-.73-2.44-1.42a8.8 8.8 0 01-3.35-2.06 4.69 4.69 0 01-1-1.78 7.12 7.12 0 01-.06-2.27A4.33 4.33 0 0118.17.06a9 9 0 012.69.09zm-8.34 1.48v1.45H7.9v13.15H4.63V3.09H0V1.66A14 14 0 010 .19h12.46z"
        fill="#0277bd"
      />
    </svg>
  );
}

export function HtmlIcon(props: ComponentProps<'svg'>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" {...props}>
      <polyline
        fill="none"
        stroke="#D4843E"
        strokeWidth="24"
        strokeMiterlimit="10"
        points="74.5,192.1 21,130 74.5,67.9"
      />
      <polyline
        fill="none"
        stroke="#D4843E"
        strokeWidth="24"
        strokeMiterlimit="10"
        points="181.5,70.1 235,132.1 181.5,194.2"
      />
      <polygon
        fill="#D4843E"
        points="119.5,202.8 92,202.8 134.5,57.2 162,57.2"
      />
    </svg>
  );
}

export function CssIcon(props: ComponentProps<'svg'>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 232" {...props}>
      <path
        d="M100.902 231.618l116.456-38.653L256 0H37.867L29.57 43.056h174.812l-5.443 27.49H23.862L15.3 113.602h174.823l-9.602 49.284-70.547 23.076-60.955-23.076 4.16-21.528H10.123L0 192.965l100.902 38.653"
        fill="#6a9fb5"
      />
    </svg>
  );
}

export function ReactIcon(props: ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 490.6 436.9"
      {...props}
    >
      <g fill="#61dafb">
        <path d="M490.6 218.5c0-32.5-40.7-63.3-103.1-82.4 14.4-63.6 8-114.2-20.2-130.4A43.84 43.84 0 00344.9.1v22.3a23.16 23.16 0 0111.4 2.6c13.6 7.8 19.5 37.5 14.9 75.7-1.1 9.4-2.9 19.3-5.1 29.4a484.62 484.62 0 00-63.5-10.9 487.8 487.8 0 00-41.6-50c32.6-30.3 63.2-46.9 84-46.9V0c-27.5 0-63.5 19.6-99.9 53.6C208.7 19.8 172.7.4 145.2.4v22.3c20.7 0 51.4 16.5 84 46.6a472.31 472.31 0 00-41.3 49.9 467 467 0 00-63.6 11c-2.3-10-4-19.7-5.2-29-4.7-38.2 1.1-67.9 14.6-75.8 3-1.8 6.9-2.6 11.5-2.6V.5a44.59 44.59 0 00-22.6 5.6c-28.1 16.2-34.4 66.7-19.9 130.1C40.5 155.4 0 186.1 0 218.5s40.7 63.3 103.1 82.4c-14.4 63.6-8 114.2 20.2 130.4 6.5 3.8 14.1 5.6 22.5 5.6 27.5 0 63.5-19.6 99.9-53.6 36.4 33.8 72.4 53.2 99.9 53.2a44.59 44.59 0 0022.6-5.6c28.1-16.2 34.4-66.7 19.9-130.1 62-19.1 102.5-49.9 102.5-82.3zm-130.2-66.7c-3.7 12.9-8.3 26.2-13.5 39.5-4.1-8-8.4-16-13.1-24s-9.5-15.8-14.4-23.4c14.2 2.1 27.9 4.7 41 7.9zm-45.8 106.5c-7.8 13.5-15.8 26.3-24.1 38.2-14.9 1.3-30 2-45.2 2s-30.2-.7-45-1.9q-12.45-17.85-24.2-38-11.4-19.6-20.8-39.8c6.2-13.4 13.2-26.8 20.7-39.9 7.8-13.5 15.8-26.3 24.1-38.2 14.9-1.3 30-2 45.2-2s30.2.7 45 1.9q12.45 17.85 24.2 38 11.4 19.65 20.8 39.8c-6.3 13.4-13.2 26.8-20.7 39.9zm32.3-13c5.4 13.4 10 26.8 13.8 39.8-13.1 3.2-26.9 5.9-41.2 8 4.9-7.7 9.8-15.6 14.4-23.7s8.9-16.1 13-24.1zM245.5 352a412.27 412.27 0 01-27.8-32c9 .4 18.2.7 27.5.7s18.7-.2 27.8-.7a390.33 390.33 0 01-27.5 32zm-74.4-58.9c-14.2-2.1-27.9-4.7-41-7.9 3.7-12.9 8.3-26.2 13.5-39.5 4.1 8 8.4 16 13.1 24s9.5 15.8 14.4 23.4zM245 85a412.27 412.27 0 0127.8 32c-9-.4-18.2-.7-27.5-.7s-18.7.2-27.8.7A390.33 390.33 0 01245 85zm-74 58.9c-4.9 7.7-9.8 15.6-14.4 23.7s-8.9 16-13 24c-5.4-13.4-10-26.8-13.8-39.8 13.1-3.1 26.9-5.8 41.2-7.9zM80.5 269.1c-35.4-15.1-58.3-34.9-58.3-50.6s22.9-35.6 58.3-50.6c8.6-3.7 18-7 27.7-10.1a480.28 480.28 0 0022.5 60.9 473.51 473.51 0 00-22.2 60.6c-9.9-3.1-19.3-6.5-28-10.2zM134.3 412c-13.6-7.8-19.5-37.5-14.9-75.7 1.1-9.4 2.9-19.3 5.1-29.4a484.62 484.62 0 0063.5 10.9 487.8 487.8 0 0041.6 50c-32.6 30.3-63.2 46.9-84 46.9a23.87 23.87 0 01-11.3-2.7zm237.2-76.2c4.7 38.2-1.1 67.9-14.6 75.8-3 1.8-6.9 2.6-11.5 2.6-20.7 0-51.4-16.5-84-46.6a472.31 472.31 0 0041.3-49.9 467 467 0 0063.6-11 279.94 279.94 0 015.2 29.1zm38.5-66.7c-8.6 3.7-18 7-27.7 10.1a480.28 480.28 0 00-22.5-60.9 473.51 473.51 0 0022.2-60.6c9.9 3.1 19.3 6.5 28.1 10.2 35.4 15.1 58.3 34.9 58.3 50.6s-23 35.6-58.4 50.6z" />
        <circle cx="245.2" cy="218.5" r="45.7" />
      </g>
    </svg>
  );
}

export function TailwindIcon(props: ComponentProps<'svg'>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" {...props}>
      <path
        d="M9,13.7q1.4-5.6,7-5.6c5.6,0,6.3,4.2,9.1,4.9q2.8.7,4.9-2.1-1.4,5.6-7,5.6c-5.6,0-6.3-4.2-9.1-4.9Q11.1,10.9,9,13.7ZM2,22.1q1.4-5.6,7-5.6c5.6,0,6.3,4.2,9.1,4.9q2.8.7,4.9-2.1-1.4,5.6-7,5.6c-5.6,0-6.3-4.2-9.1-4.9Q4.1,19.3,2,22.1Z"
        fill="#44a8b3"
      />
    </svg>
  );
}

export function NpmFileIcon(props: ComponentProps<'svg'>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 100" {...props}>
      <path
        d="m0 0v85.498h71.166v14.332h56.834v-14.332h128v-85.498z"
        fill="#cb3837"
      />
      <path
        d="m42.502 14.332h-28.17v56.834h28.17v-42.502h14.332v42.502h14.332v-56.834zm42.996 0v71.166h28.664v-14.332h28.17v-56.834zm42.502 42.502h-13.838v-28.17h13.838zm56.834-42.502h-28.17v56.834h28.17v-42.502h14.332v42.502h14.332v-42.502h14.332v42.502h14.332v-56.834z"
        fill="#fff"
      />
    </svg>
  );
}

export function FileIcon(props: ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke="currentColor"
      {...props}
    >
      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
      <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
      <path d="M10 13l-1 2l1 2" />
      <path d="M14 13l1 2l-1 2" />
    </svg>
  );
}

import type { AnchorHTMLAttributes, ReactElement } from 'react';

import { PropsWithChildren, useRef, useState } from 'react';

import { ClipboardIcon } from '@/app/Icons';

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