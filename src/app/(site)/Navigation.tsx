"use client"

import clsx from 'clsx';
import React from 'react';
import Link from 'next/link';
import { m } from 'framer-motion';
import { Menu } from '@headlessui/react';
import { usePathname } from 'next/navigation';
import type { ReactElement, ReactNode } from 'react';
import { BskyIcon, ChevronRightIcon, GitHubIcon, QuickAccessIcon, TwitterIcon } from '@/app/(site)/Icons';

import Kbd from '@/components/Kbd';

import { useScroll, useGlobal } from '@/hooks';

const mainLinks = [
  //{ title: 'About', href: '/about' },
  { title: 'Projects', href: '/projects' },
  { title: 'Blog', href: '/blog' },
  //{ title: 'Contact', href: '/work/contact' },
  { title: 'Credits', href: '/credits' },
];

const moreLinks = [
  { title: 'Contact', href: '/work/contact' },
  //{ title: 'Skills & Tools', href: '/work/skills-and-tools' },
  //{ title: 'Experience', href: '/work/experience' },
  //{ title: 'T.I.L', href: '/today-i-learned' },
  //{ title: 'Credits', href: '/credits' },
];

export default function Navbar() {
  const isScrolled = useScroll(0);

  return (
    <header
      className={clsx(
        'h-16'
      )}
    >
      <div
        className={clsx(
          'h-16', // size
          'bg-slate-100 dark:bg-[#0c1222]',
          'fixed top-0 right-0 left-0 z-[1000]', // position
          'mx-auto max-w-[120rem]', // content wrapper
          [
            isScrolled === true && [
              'border-b backdrop-blur',
              'border-divider-light dark:border-divider-dark',
              'bg-white/70 dark:bg-slate-900/80'
            ]
          ])}
      >
        <div
          className={clsx(
            'relative h-16',
            'flex items-center justify-between',
            'text-sm',
            'px-2 md:px-4'
          )}
        >
          <nav className={clsx('flex', 'md:gap-2')}>
            <NavLogo href="/" title="Home" />
            <NavButtons />
          </nav>
          <ul className={clsx('flex gap-2 items-center')}>
            <NavBsky />
            <NavTwitter />
            <NavGitHub />
            <NavSeparator />
            <NavIconQuickAccess />
          </ul>
        </div>
      </div>
    </header>
  );
}

interface LogoProps {
  active?: boolean;
}

function Logo({ active = false }: LogoProps) {
  return (
    <div className={clsx('flex items-center gap-1.5 font-[1000] leading-none')}>
      <div
        className={clsx(
          'border-box flex h-8 w-8 items-center justify-center rounded-xl border-2',
          'sm:h-6 sm:w-6 sm:rounded-lg',
          [
            active
              ? 'border-accent-600 bg-accent-600 dark:border-accent-500 dark:bg-accent-500'
              : 'border-accent-600 dark:border-accent-500',
          ]
        )}
      >
        <div
          className={clsx(
            'h-3.5 w-0.5 rotate-12 rounded-full',
            'sm:h-3 sm:w-0.5',
            [active ? 'bg-white' : 'bg-accent-600 dark:bg-accent-400']
          )}
        />
      </div>
      <div className={clsx('-mt-1 hidden text-xl', 'sm:block')}>
        <span className={clsx('text-slate-900', 'dark:text-slate-200')}>
          claycurry
        </span>
      </div>
    </div>
  );
}

function NavButtons() {
  return (
    <ul className={clsx('flex items-center', 'md:gap-1')}>
      {
        mainLinks.map((link) => (
          <li key={link.href}>
            <NavLink href={link.href} title={link.title} />
          </li>
        ))
      }
      <NavMore />
    </ul>
  )
}

function NavMore() {
  return (
    <>
      <li className={clsx('block lg:hidden')}>
        <NavLinkDropdown title="More" items={moreLinks} />
      </li>
      <li className={clsx('hidden lg:block')}>
        <NavLinkExpanded title="More" items={moreLinks} />
      </li></>
  )
}

function NavTwitter() {
  return (
    <li className={clsx('hidden', 'sm:block')}>
      <NavIcon
        href="https://twitter.com/claycurry_"
        icon={<TwitterIcon className={clsx('h-5 w-5')} />}
        title="Twitter"
      />
    </li>
  )
}


function NavBsky() {
  return (
    <li className={clsx('hidden', 'sm:block')}>
    <NavIcon
      href="https://bsky.app/profile/claycurry.com"
      icon={<BskyIcon className={clsx('h-5 w-5')} />}
      title="Bluesky"
    />
  </li>
    
  )
}

function NavGitHub() {
  return <li className={clsx('hidden', 'sm:block')}>
    <NavIcon
      href="https://github.com/clay-curry"
      icon={<GitHubIcon className={clsx('h-5 w-5')} />}
      title="GitHub"
    />
  </li>
}

type NavLink = {
  href: string;
  title: string;
};

type NavLinkProps = {
  title: string;
  href: string;
  icon?: ReactNode;
};

interface NavLogoProps {
  href: string;
  title: string;
}

interface NavLinkDropdownProps {
  title: string;
  items: Array<NavLink>;
}


function NavIcon({ href, icon, title, label = '' }: {
  href: string;
  icon: ReactElement;
  title: string;
  label?: string;
}) {
  return (
    <a
      href={href}
      className={clsx(
        'flex items-center justify-center rounded-xl',
        'hover:bg-slate-300/50',
        'dark:hover:bg-slate-800/50',
        [
          label && [
            'text-slate-800',
            'sm:bg-slate-300/50 sm:pr-3 sm:pl-1',
            'sm:hover:bg-slate-300/70',
            'dark:text-slate-100 sm:dark:bg-slate-800/50 sm:dark:hover:bg-slate-700/50',
          ],
        ]
      )}
      aria-label={`My ${title} profile`}
      title={`My ${title} profile`}
      target="_blank"
      rel="noreferrer nofollow"
    >
      <span
        className={clsx('flex h-9 w-9 items-center justify-center rounded-xl')}
      >
        {icon}
      </span>
      {label && (
        <span
          className={clsx(
            'hidden text-xs font-bold',
            'sm:block',
            'dark:font-semibold'
          )}
        >
          {label}
        </span>
      )}
    </a>
  );
}

function NavIconQuickAccess() {
  const { setQuickAccessOpen } = useGlobal();

  return (
    <li className={clsx('mr-2')}>
      <button
        type="button"
        className={clsx(
          'ml-1 flex h-9 w-9 items-center justify-center gap-2 rounded-xl bg-slate-300/50 text-slate-800',
          'xl:w-auto xl:px-3',
          'hover:bg-slate-300/70 sm:ml-0',
          'dark:bg-slate-800/50 dark:text-slate-100 dark:hover:bg-slate-700/50'
        )}
        aria-label="Open Quick Access"
        title="Open Quick Access"
        onClick={() => {
          setQuickAccessOpen(true);
        }}
      >
        <QuickAccessIcon className={clsx('h-5 w-5')} />
        <div
          className={clsx(
            'hidden items-center gap-2 text-xs font-bold',
            'xl:flex',
            'dark:font-normal'
          )}
        >
          Quick Access
          <Kbd>Q</Kbd>
        </div>
      </button>
    </li>
  );
}

function NavLink({ title, href, icon = null }: NavLinkProps) {
  return (
    <Link href={href} className={clsx('nav-link')}>
      {title}
      {icon}
    </Link>
  );
}

interface NavLinkExpandedProps {
  title: string;
  items: Array<NavLinkProps>;
}

function NavLinkExpanded({ title, items }: NavLinkExpandedProps) {
  return (
    <div className={clsx('flex')}>
      <div
        className={clsx(
          'nav-link nav-link--label pointer-events-none ml-2 mr-2'
        )}
      >
        {title}
        <ChevronRightIcon className={clsx('h-3 w-3')} />
      </div>
      <ul className={clsx('flex items-center')}>
        {items.map((item, idx) => (
          <React.Fragment key={item.href}>
            <li>
              <NavLink title={item.title} href={item.href} />
            </li>
            {idx !== items.length - 1 && (
              <li>
                <div className="nav-link__separator">&middot;</div>
              </li>
            )}
          </React.Fragment>
        ))}
      </ul>
    </div>
  );
}

function NavLinkDropdown({ title, items }: NavLinkDropdownProps) {
  return (
    <div className="relative">
      <Menu>
        {({ open }) => (
          <>
            <Menu.Button className={clsx('nav-link nav-link--label ml-2')}>
              {title}
              <ChevronRightIcon
                className={clsx('h-3 w-3 rotate-90', [open && '-rotate-90'])}
              />
            </Menu.Button>
            {open && (
              <Menu.Items
                static
                as={m.div}
                variants={{
                  hide: { opacity: 0, y: -16 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.18 } },
                }}
                initial="hide"
                animate="show"
                className={clsx(
                  'border-divider-light absolute top-11 flex w-40 flex-col rounded-2xl border bg-white/70 p-2 backdrop-blur',
                  'dark:border-divider-dark dark:bg-slate-900/80'
                )}
              >
                {items.map((item) => (
                  <Menu.Item key={item.href}>
                    {({ active }) => (
                      <Link
                        href={item.href}
                        className={clsx('nav-link h-8 text-xs', [
                          active && 'nav-link--focus',
                        ])}
                      >
                        {item.title}
                      </Link>
                    )}
                  </Menu.Item>
                ))}
              </Menu.Items>
            )}
          </>
        )}
      </Menu>
    </div>
  );
}

function NavLogo({ href, title }: NavLogoProps) {
  const isActive = usePathname() === href;

  return (
    <Link
      href={href}
      className={clsx('flex h-9 items-center gap-2 rounded-xl px-2')}
      aria-label={title}
    >
      <Logo active={isActive} />
    </Link>
  );
}

function NavSeparator() {
  return <li className={clsx('hidden', 'sm:block')}>
    <div
      className={clsx(
        'ml-2 mr-4 h-3 w-[1px]',
        'bg-slate-200 dark:bg-slate-700'
      )}
    />
  </li>

}