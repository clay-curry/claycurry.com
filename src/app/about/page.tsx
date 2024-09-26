"use client"
import clsx from 'clsx';
import { useState } from 'react';
import { m } from 'framer-motion';

import Page from '@/app/_lib/contents-layouts/Page';
import { GitHubIcon, NpmIcon } from '@/app/_lib/components/Icons';
import { SectionButton } from '@/app/_lib/components/sections/SectionButton';
import SectionContent from '@/app/_lib/components/sections/SectionContent';
import SectionTitle from '@/app/_lib/components/sections/SectionTitle';
import AppWindow from '@/app/_lib/components/wireframes/AppWindow';
import GitHubWireframe from '@/app/_lib/components/wireframes/GitHub';
import NpmWireframe from '@/app/_lib/components/wireframes/Npm';

function ProjectsContents() {
  const [currentState, setCurrentState] = useState<'npm' | 'github'>('github');

  return (
    <>
      <SectionTitle
        title="The dynamic accent colors."
        caption="tailwindcss-accent"
        description="Add accent colors for dynamic, flexible color use in your Tailwind CSS project."
        button={{
          title: 'learn more',
          href: '/docs/tailwindcss-accent',
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
                      title: 'clay-curry/tailwindcss-accent - GitHub',
                      isActive: currentState === 'github',
                    },
                    {
                      icon: <NpmIcon className="h-4 w-4" />,
                      title: 'tailwindcss-accent - npm',
                      isActive: currentState === 'npm',
                    },
                  ]}
                >
                  {currentState === 'github' && (
                    <GitHubWireframe
                      author="clay-curry"
                      license="MIT"
                      repository="tailwindcss-accent"
                      description="Adds accent colors for more dynamic and flexible color utilization."
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

export default function AboutPage() {
  return (
    <main>
      Heritage: I am fortunate thanks to my paternal grandmother (or just "Momo") to 
      know my familial roots in the United States go at least back to the original 
      British colonies, but the knowledge from where my ancestors actually emigrated 
      before arriving in the Western world is currently lost. The pigment of my skin and 
      facial features suggest I inherit Nordic or Irish diaspora, but this is all the knowledge
      I have about my ancestors. 

      
      Childhood: I should like to imagine that the village who raised me nurtured an
      ambitious challenger of thought, but my adult life has showed me that others are 
      probably more up for the job. 
      
      
      Growing up, it never occurred to me that I might have some unusual ability to notice 
      patterns until I got back my mathematics sub-score from the standard college entrance exams
      used in my country. Part of me still believes a charitable database error explains why I found 
      myself among the 99.5 percentile of test-takers who score perfectly, this is likely the best 
      explanation available for the origins of my interest in programming language compilers.
      


    </main>
  );
}