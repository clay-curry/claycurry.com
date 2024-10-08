"use client"
 
import { useState } from 'react';
import { m } from 'framer-motion';
import clsx from 'clsx';

import { SkeletonSm } from '@/components/Skeletons';

import Page from '@/components/contents-layouts/Page';
import { TypeScriptIcon, GitHubIcon, NpmIcon } from '@/app/(site)/Icons';
import { SectionButton } from '@/components/sections/SectionButton';
import SectionContent from '@/components/sections/SectionContent';
import SectionTitle from '@/components/sections/SectionTitle';
import AppWindow from '@/components/AppWindow';
 
function GitHubWireframe({
  author = '',
  license = '',
  repository,
  description,
}: {
  author?: string;
  license?: string;
  repository: string;
  description: string;
}) {
  return (
    <div
      className={clsx(
        'h-full w-full bg-white p-4 text-sm text-slate-600',
        'dark:bg-slate-900 dark:text-slate-400'
      )}
    >
      <div className={clsx('flex items-center gap-1')}>
        <div className={clsx('mr-1')}>
          <SkeletonSm />
        </div>
        {author ? (
          <div className={clsx('-mt-0.5 text-blue-700', 'dark:text-blue-500')}>
            {author}
          </div>
        ) : (
          <SkeletonSm w={64} />
        )}
        <div className={clsx('-mt-0.5')}>/</div>
        <div
          className={clsx(
            '-mt-0.5 font-bold text-blue-700',
            'dark:font-semibold dark:text-blue-500'
          )}
        >
          {repository}
        </div>
        <div
          className={clsx(
            'border-divider-light ml-1 rounded-full border px-2 py-0.5 text-xs',
            'dark:border-divider-dark'
          )}
        >
          public
        </div>
      </div>
      <div className={clsx('mt-2')}>
        <p>{description}</p>
      </div>
      <div className={clsx('mt-6 flex flex-col gap-3')}>
        <div className={clsx('flex items-center gap-2')}>
          <SkeletonSm />
          {license ? (
            <div className={clsx('')}>
              <p>{license} license</p>
            </div>
          ) : (
            <SkeletonSm w={64} />
          )}
        </div>
        <div className={clsx('flex items-center gap-3')}>
          <div className={clsx('flex items-center gap-1')}>
            <SkeletonSm />
            <SkeletonSm w={48} />
          </div>
          <div className={clsx('flex items-center gap-1')}>
            <SkeletonSm />
            <SkeletonSm w={56} />
          </div>
        </div>
      </div>
      <div className={clsx('mt-6 flex gap-2')}>
        <div
          className={clsx(
            'border-divider-light flex h-8 flex-1 items-center justify-center rounded-lg border',
            'dark:border-divider-dark'
          )}
        >
          <div className={clsx('flex items-center gap-1')}>
            <SkeletonSm />
            <SkeletonSm w={48} />
          </div>
        </div>
        <div
          className={clsx(
            'border-divider-light flex h-8 flex-1 items-center justify-center rounded-lg border',
            'dark:border-divider-dark'
          )}
        >
          <div className={clsx('flex items-center gap-1')}>
            <SkeletonSm />
            <SkeletonSm w={64} />
          </div>
        </div>
      </div>
      <div
        className={clsx(
          'border-divider-light mt-4 flex border-b',
          'dark:border-divider-dark'
        )}
      >
        <div className={clsx('-mb-[2px] flex h-12')}>
          <div
            className={clsx(
              'flex items-center gap-1 border-b-[3px] border-amber-400 px-6 dark:border-amber-900'
            )}
          >
            <SkeletonSm />
            <SkeletonSm w={32} />
          </div>
        </div>
        <div className={clsx('-mb-[2px] flex h-12')}>
          <div
            className={clsx(
              'flex items-center gap-1 border-b-[3px] border-transparent px-6'
            )}
          >
            <SkeletonSm />
            <SkeletonSm w={40} />
          </div>
        </div>
        <div className={clsx('-mb-[2px] flex h-12')}>
          <div
            className={clsx(
              'flex items-center gap-1 border-b-[3px] border-transparent px-6'
            )}
          >
            <SkeletonSm />
            <SkeletonSm w={80} />
          </div>
        </div>
        <div className={clsx('-mb-[2px] flex h-12')}>
          <div
            className={clsx(
              'flex items-center gap-1 border-b-[3px] border-transparent px-6'
            )}
          >
            <SkeletonSm />
            <SkeletonSm w={48} />
          </div>
        </div>
        <div className={clsx('-mb-[2px] flex h-12')}>
          <div
            className={clsx(
              'flex items-center gap-1 border-b-[3px] border-transparent px-6'
            )}
          >
            <SkeletonSm />
            <SkeletonSm w={40} />
          </div>
        </div>
      </div>
    </div>
  );
} 

function NpmWireframe({
  packageName,
  description,
  isWithTypeScript = false,
}: {
  packageName: string;
  description: string;
  isWithTypeScript?: boolean;
}) {
  return (
    <div
      className={clsx(
        'h-full w-full bg-white p-4 text-sm text-slate-600',
        'dark:bg-slate-900 dark:text-slate-400'
      )}
    >
      <div className={clsx('flex items-center gap-2 text-lg font-bold')}>
        {packageName}
        {isWithTypeScript && (
          <div className={clsx('')}>
            <TypeScriptIcon className={clsx('ml-1 h-5 w-5')} />
          </div>
        )}
      </div>
      <div
        className={clsx('mt-2 flex items-center gap-2 text-lg text-slate-400')}
      >
        <SkeletonSm w={60} />
        <div className={clsx('-mt-1')}>&middot;</div>
        <SkeletonSm w={40} />
        <div className={clsx('-mt-1')}>&middot;</div>
        <SkeletonSm w={120} />
      </div>
      <div className={clsx('mt-4')}>
        <div className={clsx('flex')}>
          <div
            className={clsx(
              'flex gap-2 rounded-t-lg border-b-2 border-yellow-400 bg-yellow-50 p-3 px-4',
              'dark:bg-yellow-400/10'
            )}
          >
            <div
              className={clsx(
                'flex h-4 items-center rounded-md bg-yellow-400/50',
                'dark:bg-yellow-400/30'
              )}
              style={{ width: 16 }}
            />
            <div
              className={clsx(
                'flex h-4 items-center rounded-md bg-yellow-400/50',
                'dark:bg-yellow-400/30'
              )}
              style={{ width: 64 }}
            />
          </div>
          <div
            className={clsx('flex gap-2 border-b-2 border-orange-400 p-3 px-4')}
          >
            <SkeletonSm />
            <SkeletonSm w={54} />
          </div>
          <div
            className={clsx('flex gap-2 border-b-2 border-red-400 p-3 px-4')}
          >
            <SkeletonSm />
            <SkeletonSm w={72} />
          </div>
          <div
            className={clsx('flex gap-2 border-b-2 border-purple-400 p-3 px-4')}
          >
            <SkeletonSm />
            <SkeletonSm w={72} />
          </div>
          <div
            className={clsx('flex gap-2 border-b-2 border-sky-400 p-3 px-4')}
          >
            <SkeletonSm />
            <SkeletonSm w={48} />
          </div>
          <div
            className={clsx('flex gap-2 border-b-2 border-red-400 p-3 px-4')}
          >
            <SkeletonSm />
            <SkeletonSm w={48} />
          </div>
        </div>
      </div>
      <div className={clsx('mt-4')}>
        <div
          className={clsx(
            'border-divider-light mt-8 border-l-4 bg-slate-200/40 p-2 px-4',
            'dark:border-divider-dark dark:bg-slate-100/5'
          )}
        >
          <p>{description}</p>
        </div>
        <div
          className={clsx(
            'border-divider-light my-4 border-b',
            'dark:border-divider-dark'
          )}
        />
        <div className={clsx('mt-4 flex flex-col gap-2')}>
          <SkeletonSm w={400} />
          <SkeletonSm w={200} />
        </div>
      </div>
    </div>
  );
}
 
function ProjectsContents() {
  const [currentState, setCurrentState] = useState<'npm' | 'github'>('github');

  return (
    <>
      <SectionTitle
        title="This portfolio website."
        caption="claycurry.com"
        description="Showcases modern React 19 / Next.js 15 patterns for building declarative UI."
        button={{
          title: 'learn more',
          href: '/projects/claycurry-com',
        }}
      />
      <SectionContent>
        <div className={clsx('flex', 'lg:gap-12')}>
          <div className={clsx('hidden flex-1 flex-col gap-3 pt-8', 'lg:flex')}>
            <div className={clsx('flex flex-col gap-3')}>
              <SectionButton
                title="Available on GitHub"
                icon={<GitHubIcon className={clsx('my-2 h-16 w-16')} />}
                description="Access powerful and flexible package on GitHub with MIT license."
                active={currentState === 'github'}
                onClick={() => setCurrentState('github')}
              />
              <SectionButton
                title="npm package"
                icon={<NpmIcon className={clsx('my-2 h-16 w-16')} />}
                description="Install and use the package with ease thanks to its typed options."
                active={currentState === 'npm'}
                onClick={() => setCurrentState('npm')}
              />
            </div>
          </div>
          <div className={clsx('w-full', 'lg:w-auto')}>
            <div className={clsx('-mt-[41px]')}>
              <div className={clsx('w-full', 'lg:h-[400px] lg:w-[600px]')}>
                <AppWindow
                  type="browser"
                  browserTabs={[
                    {
                      icon: <GitHubIcon className="h-4 w-4" />,
                      title: 'clay-curry/claycurry.com',
                      isActive: currentState === 'github',
                    },
                    {
                      icon: <NpmIcon className="h-4 w-4" />,
                      title: 'claycurry.com - npm',
                      isActive: currentState === 'npm',
                    },
                  ]}
                >
                  {currentState === 'github' && (
                    <GitHubWireframe
                      author="clay-curry"
                      license="MIT"
                      repository="claycurry.com"
                      description="Showcases modern, declarative programming patterns for building UI in React 19 / Next.js 15."
                    />
                  )}
                  {currentState === 'npm' && (
                    <NpmWireframe
                      packageName="tailwindcss-accent"
                      description="Adds accent colors for more dynamic and flexible color utilization."
                      isWithTypeScript
                    />
                  )}
                </AppWindow>
              </div>
            </div>
          </div>
        </div>
      </SectionContent>
    </>
  );
}

function HeaderImage() {

  const animation = {
    hide: { pathLength: 0.2 },
    show: (i) => {
      const delay = 0.2 + i * 0.1;
      return {
        pathLength: 1,
        transition: {
          pathLength: { delay, duration: 0.8 },
        },
      };
    },
  };

  return (
    <m.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 631 620"
      fill="none"
      initial="hide"
      animate="show"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={clsx(
        'stroke-accent-500 -mt-20 h-full opacity-60',
        'dark:opacity-40'
      )}
    >
      <m.rect
        x="254.558"
        y="1.41421"
        width="122"
        height="358"
        rx="61"
        transform="rotate(45 254.558 1.41421)"
        variants={animation}
        custom={1}
      />
      <m.rect
        x="341.105"
        y="421.087"
        width="122"
        height="358"
        rx="61"
        transform="rotate(135 341.105 421.087)"
        variants={animation}
        custom={2}
      />
      <m.rect
        y="1.41421"
        width="122"
        height="358"
        rx="61"
        transform="matrix(-0.707107 0.707107 0.707107 0.707107 374.96 111.414)"
        variants={animation}
        custom={3}
      />
      <m.rect
        x="1.41421"
        y="-1.19209e-07"
        width="122"
        height="358"
        rx="61"
        transform="matrix(0.707107 0.707107 0.707107 -0.707107 288.414 531.087)"
        variants={animation}
        custom={4}
      />
    </m.svg>
  );
}

function Projects() {
  return (
    <Page
      frontMatter={{
        title: 'Projects',
        description: 'Showcasing just some my previous work and selected small projects.',
      }}
      headerImage={<HeaderImage />}
    >
      <ProjectsContents />
    </Page>
  );
}

export default Projects;
