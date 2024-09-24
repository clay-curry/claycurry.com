"use client"

import clsx from 'clsx';

import { GitHubIcon, TwitterIcon } from '@/app/_lib/components/Icons';
import NavIcon from '@/app/_lib/components/navigations/NavIcon';
import NavIconQuickAccess from '@/app/_lib/components/navigations/NavIconQuickAccess';
import NavLink from '@/app/_lib/components/navigations/NavLink';
import NavLinkDropdown from '@/app/_lib/components/navigations/NavLinkDropdown';
import NavLinkExpanded from '@/app/_lib/components/navigations/NavLinkExpanded';
import NavLogo from '@/app/_lib/components/navigations/NavLogo';

import useOnScroll from '@/app/_lib/hooks/useOnScroll';

const workLinks = [
  { title: 'Skills & Tools', href: '/work/skills-and-tools' },
  { title: 'Experience', href: '/work/experience' },
  { title: 'Studio', href: '/work/studio' },
  { title: 'Contact', href: '/work/contact' },
];

function Navbar() {
  const isScrolled = useOnScroll(0);

  return (
    <header
      className={clsx(
        'h-18 fixed top-0 right-0 left-0 z-[1000] fm:absolute',
        [
          isScrolled === true && [
            'border-divider-light border-b bg-white/70 backdrop-blur',
            'dark:border-divider-dark dark:bg-slate-900/80'
          ]
        ]
      )}
    >
      <div className={clsx('content-wrapper-max')}>
        <div
          className={clsx(
            'relative z-50 flex h-16 items-center justify-between px-2 text-sm',
            'md:px-4'
          )}
        >
          <nav className={clsx('flex', 'md:gap-2')} data-accent="violet">
            <NavLogo href="/" title="Home" />
            <ul className={clsx('flex items-center', 'md:gap-1')}>
              <li>
                <NavLink title="Projects" href="/projects" />
              </li>
              <li>
                <NavLink title="Blog" href="/blog" />
              </li>
              <li>
                <NavLink title="T.I.L" href="/today-i-learned" />
              </li>
              <li className={clsx('block lg:hidden')} data-accent="blue">
                <NavLinkDropdown title="More" items={workLinks} />
              </li>
              <li className={clsx('hidden lg:block')} data-accent="blue">
                <NavLinkExpanded title="More" items={workLinks} />
              </li>
            </ul>
          </nav>
          <ul className={clsx('flex items-center')}>
            <li className={clsx('hidden', 'sm:block')}>
              <NavIcon
                href="https://twitter.com/claycurry_"
                icon={<TwitterIcon className={clsx('h-5 w-5')} />}
                title="Twitter"
              />
            </li>
            <li className={clsx('hidden', 'sm:block')}>
              <NavIcon
                href="https://github.com/clay-curry"
                icon={<GitHubIcon className={clsx('h-5 w-5')} />}
                title="GitHub"
              />
            </li>
            <li className={clsx('hidden', 'sm:block')}>
              <div
                className={clsx(
                  'ml-2 mr-4 h-3 w-[1px] bg-slate-200',
                  'dark:bg-slate-700'
                )}
              />
            </li>
            <li className={clsx('mr-2')}>
              <NavIconQuickAccess />
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
