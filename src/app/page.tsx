"use client"

// TODO:
// - add support for reduced motion

import clsx from 'clsx';
import Link from 'next/link';
import Image from 'next/image';
import { ReactElement, useState } from 'react';
import { m, useReducedMotion } from 'framer-motion';
import { useAnimationControls } from 'framer-motion';

import {
  FigmaIcon,
  FramerMotionIcon,
  NextJsIcon,
  ReactIcon,
  TailwindCssIcon,
  TypeScriptIcon,
  VSCodeIcon,
  QuoteIcon,
  CodeIcon, HeartIcon, SparklesIcon, CalendarIcon
} from '@/app/_lib/components/Icons';
import { DocumentIcon } from '@/app/_lib/components/Icons';
import { SectionButton } from '@/app/_lib/components/sections/SectionButton';
import SectionContent from '@/app/_lib/components/sections/SectionContent';
import SectionTitle from '@/app/_lib/components/sections/SectionTitle';


function HeaderTechStack() {

  const animation = {
    hide: { x: -8, opacity: 0 },
    show: {
      x: 0,
      opacity: 1,
    },
  };


  return (
    <div>
      <m.p
        className={clsx('mb-2.5 text-sm text-slate-600', 'dark:text-slate-400')}
        initial={animation.hide}
        animate={animation.show}
        transition={{ delay: 0.6 }}
      >
        current favorite tech stack/tools: (tools: (Nextjs, Webpack, Grafana))
      </m.p>
      <m.ul
        className={clsx(
          'flex items-center gap-3.5 text-slate-500',
          'dark:text-slate-500'
        )}
        initial="hide"
        animate="show"
        transition={{ delayChildren: 0.6, staggerChildren: 0.025 }}
      >
        <m.li variants={animation}>
          <div className={clsx('transition duration-200 hover:text-[#3178C6]')}>
            <TypeScriptIcon className={clsx('h-6 w-6')} />
          </div>
        </m.li>
        <m.li variants={animation}>
          <div className={clsx('transition duration-200 hover:text-[#61DAFB]')}>
            <ReactIcon className={clsx('h-6 w-6')} />
          </div>
        </m.li>
        <m.li variants={animation}>
          <div className={clsx('transition duration-200 hover:text-[#06B6D4]')}>
            <TailwindCssIcon className={clsx('h-6 w-6')} />
          </div>
        </m.li>
        <m.li variants={animation}>
          <div className={clsx('transition duration-200 hover:text-[#0055FF]')}>
            <FramerMotionIcon className={clsx('h-6 w-6')} />
          </div>
        </m.li>
        <m.li variants={animation}>
          <div
            className={clsx(
              'transition duration-200 hover:text-[#000000] dark:hover:text-[#FFFFFF]'
            )}
          >
            <NextJsIcon className={clsx('h-6 w-6')} />
          </div>
        </m.li>
        <m.li variants={animation}>
          <div className={clsx('h-3 w-[1px] bg-slate-300 dark:bg-slate-700')} />
        </m.li>
        <m.li variants={animation}>
          <div className={clsx('transition duration-200 hover:text-[#007ACC]')}>
            <VSCodeIcon className={clsx('h-6 w-6')} />
          </div>
        </m.li>
        <m.li variants={animation}>
          <div className={clsx('transition duration-200 hover:text-[#F24E1E]')}>
            <FigmaIcon className={clsx('h-6 w-6')} />
          </div>
        </m.li>
      </m.ul>
    </div>
  );
}




function Hero() {

  const WaveILY = () => <m.div
    initial={{ opacity: 0, y: 16, rotate: 30, transformOrigin: 'right center' }}
    animate={{ opacity: 1, y: 0, rotate: 0 }}
    transition={{ type: 'spring', delay: 0.25, bounce: 0.7, duration: 0.7 }}
  >
    🤟
  </m.div>

  const AvailableForHire = () =>
    <div
      className={clsx(
        'button button--ghost text-accent-500 pointer-events-none gap-2.5 px-2.5',
        'md:button--big md:px-2.5',
        'dark:text-accent-400'
      )}
    >
      <span className={clsx('relative flex h-2 w-2')}>
        <span
          className={clsx(
            'bg-accent-600 absolute -top-1 -left-1 inline-flex h-4 w-4 animate-ping rounded-full opacity-75',
            'dark:bg-accent-300'
          )}
        />
        <span
          className={clsx(
            'bg-accent-500 relative inline-flex h-2 w-2 rounded-full',
            'dark:bg-accent-400'
          )}
        />
      </span>
      Available for hire
    </div>


  const LetsWorkTogetherButton = () =>
    <Link
      href="/work/contact"
      className={clsx('button min-w-[128px]', 'md:button--big')}
    >
      <CodeIcon className={clsx('h-5 w-5')} />
      Work together
    </Link>

  const ButtonResume = () =>
    <a
      target="_blank"
      rel="noreferrer nofollow"
      href="https://www.figma.com/community/file/1176377524040948926"
      className={clsx('button button--ghost px-2', 'md:button--big md:px-2')}
    >
      <DocumentIcon className={clsx('h-5 w-5')} />
      Resume
    </a>


  const HeroCta = ({
    isFree = true,
    isFreeAnimationDuration = 4,
  }: {
    isFree?: boolean;
    isFreeAnimationDuration?: number;
  }) => {
    const shouldReduceMotion = useReducedMotion();

    return (
      <m.div className={clsx('flex gap-2')} initial="hide" animate="show">
        <m.div variants={{
          hide: { x: -16, opacity: 0 },
          show: { x: 0, opacity: 1 },
        }} transition={{ delay: 0.4 }}>
          <ButtonResume />
        </m.div>

        <m.div
          className={clsx('relative z-20')}
          variants={{
            hide: { x: -16, opacity: 0 },
            show: { x: 0, opacity: 1 },
          }}
          transition={{ delay: 0.5 }}
        >
          <LetsWorkTogetherButton />
        </m.div>
      </m.div>
    );
  }

  const SlideIn = ({ delay = 0.1, className, children }: { delay?: number, className?: string, children: React.ReactNode }) => <m.div
    className={className}
    initial={{ x: -32, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ delay }}
  >
    {children}
  </m.div>


  return (

    <div className={clsx('relative z-10')}>
      <div className={clsx('text-slate-700', 'dark:text-slate-300')}>
        {/* hero text line 1*/}
        <SlideIn
          className={clsx(
            'mb-1 flex items-center gap-1 text-2xl text-slate-600',
            'md:mb-0 md:gap-2 md:text-4xl',
            'dark:text-slate-400'
          )}
        >
          hi!
          <WaveILY /> {/* wave 🤟 emoji */}
          <AvailableForHire />
        </SlideIn>


        {/* hero text line 2*/}
        <SlideIn
          className={clsx(
            'mb-4 block text-[2.5rem] font-[1000] leading-none',
            'md:mb-6 md:text-7xl'
          )}
          delay={0.2}
        >
          I&apos;m{' '}
          <span className={clsx('text-accent-600', 'dark:text-accent-500')}>
            Clay
          </span>{' '}
          Curry,{' '}
        </SlideIn>


        {/* hero text line 3*/}
        <SlideIn
          className={clsx(
            'max-w-xl text-pretty',
            'block tracking-wide',
            'md:text-xl',
            'text-slate-600',
            'dark:text-slate-400'
          )}
          delay={0.3}
        >
          a
          {' '}
          <strong
            className={clsx(
              'font-bold lowercase',
              'text-slate-700',
              'dark:text-slate-300'
            )}
          >
            builder
          </strong>
          {' '}

          skilled in UI design, programming
          language design, visual analytics, and system observability.
        </SlideIn>
      </div>


      <div className={clsx('mt-6 md:mt-8')}>
        <HeroCta />
      </div>
    </div>


  );
}

function FeaturedCardSection() {

  function FeaturedCard({ icon, title, desc }: {
    icon: ReactElement;
    title: string;
    desc: string;
  }) {
    return (
      <div
        className={clsx(
          'border-divider-light relative z-10 flex-1 rounded-2xl border bg-white',
          'dark:border-divider-dark dark:bg-slate-900'
        )}
      >
        <div
          className={clsx(
            'border-divider-light absolute inset-x-0 inset-y-8 z-[-1] border-t',
            'dark:border-divider-dark'
          )}
        />
        <div
          className={clsx(
            'border-divider-light absolute inset-y-0 inset-x-8 z-[-1] border-l',
            'dark:border-divider-dark'
          )}
        />
        <div className={clsx('-mt-0.5')}>
          <div
            className={clsx(
              'mt-4 mr-2 ml-4 flex items-center gap-6 rounded-full bg-slate-100',
              'dark:bg-slate-800'
            )}
          >
            <div className={clsx('-m-2')}>{icon}</div>
            <div
              className={clsx(
                'truncate py-2 pr-4 text-sm font-bold text-slate-700',
                'dark:text-slate-300'
              )}
            >
              {title}
            </div>
          </div>
        </div>
        <div
          className={clsx(
            'p-4 pl-12 text-sm text-slate-600',
            'dark:text-slate-400'
          )}
        >
          {desc}
        </div>
      </div>
    );
  }


  return (
    <div className={clsx('content-wrapper')}>
      <div className={clsx('flex flex-col gap-4', 'lg:flex-row lg:gap-8')}>
        <FeaturedCard
          icon={
            <div
              className={clsx(
                'rounded-full bg-amber-300 p-3.5',
                'dark:bg-amber-900'
              )}
            >
              <SparklesIcon className={clsx('h-5 w-5 text-white')} />
            </div>
          }
          title="Clean & Intuitive"
          desc="Keep the UI clean with a modern touch without compromising UX."
        />
        <FeaturedCard
          icon={
            <div
              className={clsx(
                'rounded-full bg-pink-300 p-3.5',
                'dark:bg-pink-900'
              )}
            >
              <HeartIcon className={clsx('h-5 w-5 text-white')} />
            </div>
          }
          title="Detail Oriented"
          desc="Awareness to ease of access, UI consistency, and improved UX."
        />
        <FeaturedCard
          icon={
            <div
              className={clsx(
                'rounded-full bg-sky-300 p-3.5',
                'dark:bg-sky-900'
              )}
            >
              <CodeIcon className={clsx('h-5 w-5 text-white')} />
            </div>
          }
          title="Pretty & Optimized"
          desc="Writing clean code is a top priority while keeping it as optimized as possible."
        />
      </div>
    </div>
  );
}

function QuoteSection() {

  function Quote() {
    return (
      <blockquote
        className={clsx(
          'flex gap-2 pt-2 text-3xl text-slate-500',
          'md:text-4xl lg:pt-0 lg:text-5xl',
          'dark:text-slate-400'
        )}
      >
        <QuoteIcon
          className={clsx(
            '-mt-1 h-10 text-slate-300',
            'md:-mt-3 md:h-16 lg:h-24',
            'dark:text-slate-800'
          )}
        />
        <span className={clsx('flex flex-col')}>
          <span className={clsx('leading-[1.15]')}>
            <em>Effective software</em>{' '}
          </span>
          <span
            className={clsx('flex items-center gap-2 leading-[1.15]', 'lg:gap-4')}
          >
            <span
              className={clsx(
                'mt-1 h-0.5 w-8 rounded-full bg-slate-400',
                'lg:h-1 lg:w-24',
                'dark:bg-slate-600'
              )}
            />
            <span>
              <strong
                className={clsx(
                  'font-extrabold text-slate-600',
                  'dark:text-slate-300'
                )}
              >
                inside
              </strong>{' '}
              and{' '}
              <strong
                className={clsx(
                  'font-extrabold text-slate-600',
                  'dark:text-slate-300'
                )}
              >
                out{' '}
              </strong>
            </span>
            <span
              className={clsx(
                'mt-1 h-0.5 w-6 rounded-full bg-slate-400',
                'lg:h-1 lg:w-14',
                'dark:bg-slate-600'
              )}
            />
          </span>
          <span className={clsx('leading-[1.15]')}>
            is a{' '}
            <strong
              className={clsx(
                'relative font-extrabold text-slate-600',
                'dark:text-slate-300'
              )}
            >
              <span
                className={clsx(
                  'absolute -left-0.5 right-0 top-1 bottom-0 z-[-1] rounded-md bg-slate-100 px-1',
                  'lg:-left-1.5 lg:-right-0.5 lg:top-2 lg:bottom-0',
                  'dark:bg-slate-800'
                )}
              />
              must.
            </strong>
          </span>
        </span>
      </blockquote>
    );
  }


  return (
    <div className={clsx('content-wrapper')}>
      <div className={clsx('flex items-center justify-center py-8')}>
        <Quote />
      </div>
    </div>
  );
}

function CleanIntuitive() {

  type TodoItemState = 'spacing' | 'typography' | 'colors' | 'effects';

  type Content = {
    state: TodoItemState;
    shows: Array<TodoItemState>;
    title: string;
    description: string;
  };

  const content: Array<Content> = [
    {
      state: 'typography',
      shows: ['typography'],
      title: 'Typography',
      description: 'Selecting the font type, font size, and font weight.',
    },
    {
      state: 'spacing',
      shows: ['typography', 'spacing'],
      title: 'Spacing',
      description: 'Positioning and adding spacing between elements.',
    },
    {
      state: 'colors',
      shows: ['typography', 'spacing', 'colors'],
      title: 'Colors',
      description: 'Choosing a color scheme with sufficient contrast.',
    },
    {
      state: 'effects',
      shows: ['typography', 'spacing', 'colors', 'effects'],
      title: 'Effects',
      description: 'Add effects like borders, shadows, rounded corners, etc.',
    },
  ];

  const [currentState, setCurrentState] = useState<Content | null>(null);

  function TodoItem({
    state,
    title = 'Create Documentations',
    description = 'It is good to create early documentation for our new library.',
    date = '10:00 AM · Tomorrow',
    tag1 = 'Docs',
    tag2 = 'Support',
  }: {
    state: Array<TodoItemState>;
    title?: string;
    description?: string;
    date?: string;
    tag1?: string;
    tag2?: string;
  }) {
    return (
      <div
        className={clsx(
          'pointer-events-none w-full select-none border p-6',
          'lg:w-96',
          state.includes('effects') && ['rounded-xl '],
          state.includes('spacing') && [''],
          state.includes('typography') ? ['text-sm'] : ['font-serif'],
          state.includes('colors')
            ? [
              'border-divider-light bg-white',
              'dark:border-divider-dark dark:bg-slate-900',
            ]
            : ['border-black bg-white', 'dark:border-white dark:bg-[#050914]']
        )}
        role="presentation"
      >
        <div
          className={clsx(
            'flex items-center',
            state.includes('spacing') && ['mb-4 justify-between']
          )}
        >
          <div className={clsx('flex')}>
            <div
              className={clsx(
                'relative flex h-8 w-8 items-center justify-center',
                state.includes('effects') && ['rounded-full'],
                state.includes('spacing') && [''],
                state.includes('typography') && ['font-bold'],
                state.includes('colors')
                  ? ['border-white bg-sky-400 text-white']
                  : [
                    'border-white bg-[#050914] text-white',
                    'dark:bg-white dark:text-black',
                  ]
              )}
            >
              E
            </div>
          </div>
          <div
            className={clsx(
              state.includes('effects') && ['rounded-full'],
              state.includes('spacing') && ['px-2 py-0.5'],
              state.includes('typography') && ['text-xs font-bold'],
              state.includes('colors')
                ? [
                  'bg-red-100 text-red-800',
                  'dark:bg-red-500/20 dark:text-red-300',
                ]
                : ['bg-[#ff0000] text-white']
            )}
          >
            High
          </div>
        </div>
        <div
          className={clsx(
            state.includes('spacing') && ['mb-1'],
            state.includes('typography') && ['text-lg font-bold'],
            state.includes('colors')
              ? ['text-slate-700', 'dark:text-slate-300']
              : ['text-black', 'dark:text-white']
          )}
        >
          {title}
        </div>
        <div
          className={clsx(
            state.includes('spacing') && ['mb-4'],
            state.includes('typography') && [''],
            state.includes('colors')
              ? ['text-slate-600', 'dark:text-slate-400']
              : ['text-black', 'dark:text-white']
          )}
        >
          {description}
        </div>
        <div
          className={clsx(
            'flex',
            state.includes('spacing') && ['mb-6 gap-2'],
            state.includes('typography') && ['text-xs font-bold'],
            state.includes('colors') && ['']
          )}
        >
          <div
            className={clsx(
              state.includes('effects') && ['rounded-full'],
              state.includes('spacing') && ['px-2 py-0.5'],
              state.includes('typography') && [''],
              state.includes('colors')
                ? [
                  'bg-blue-100 text-blue-700',
                  'dark:bg-blue-500/20 dark:text-blue-300',
                ]
                : ['bg-[#0000ff] text-white']
            )}
          >
            {tag1}
          </div>
          <div
            className={clsx(
              state.includes('effects') && ['rounded-full'],
              state.includes('spacing') && ['px-2 py-0.5'],
              state.includes('typography') && [''],
              state.includes('colors')
                ? [
                  'bg-yellow-100 text-yellow-700',
                  'dark:bg-yellow-500/20 dark:text-yellow-300',
                ]
                : ['bg-[#ffff00] text-black']
            )}
          >
            {tag2}
          </div>
        </div>
        <div
          className={clsx(
            'flex items-center',
            state.includes('spacing') && ['gap-1 '],
            state.includes('typography') && ['text-xs font-medium'],
            state.includes('colors') && ['']
          )}
        >
          <CalendarIcon
            className={clsx(
              'h-4 w-4',
              state.includes('spacing') && ['-mt-1'],
              state.includes('typography') && [''],
              state.includes('colors')
                ? ['text-slate-400', 'dark:text-slate-600']
                : ['h-4 w-4 text-black', 'dark:text-white']
            )}
          />
          <div
            className={clsx(
              state.includes('spacing') && [''],
              state.includes('typography') && [''],
              state.includes('colors')
                ? ['text-slate-600', 'dark:text-slate-400']
                : ['text-black', 'dark:text-white']
            )}
          >
            {date}
          </div>
        </div>
      </div>
    );
  }


  return (
    <>
      <header className={clsx('mb-8')}>
        <SectionTitle
          title="Meaningful & Purpose-Driven Visual Design."
          caption="Visual Communication"
          description="Following battle-tested design patterns, technical standards, and software frameworks simplify the creative process."
        />
      </header>
      <SectionContent>
        <div className={clsx('flex', 'lg:gap-12')}>
          <div
            className={clsx('-mt-8 hidden flex-1 flex-col gap-3', 'lg:flex')}
          >
            {content.map((item, i) => (
              <SectionButton
                key={item.state}
                title={item.title}
                description={item.description}
                icon={i + 1}
                active={currentState?.state === item.state}
                onClick={() => setCurrentState(item)}
              />
            ))}
          </div>
          <div
            className={clsx('relative flex flex-1 items-center justify-center')}
          >
            <div
              className={clsx('-mt-8 flex gap-4', 'md:gap-6 lg:top-8 lg:mt-0')}
            >
              <div>
                <TodoItem
                  state={
                    currentState
                      ? currentState.shows
                      : ['typography', 'spacing', 'colors', 'effects']
                  }
                />
              </div>
              <div className={clsx('hidden', 'sm:block lg:hidden')}>
                <TodoItem
                  state={
                    currentState
                      ? currentState.shows
                      : ['typography', 'spacing', 'colors', 'effects']
                  }
                  title="UI Implementation"
                  description="Start creating UI components using React and Tailwind CSS."
                  date="10:00 AM · Tomorrow"
                  tag1="Design"
                  tag2="Components"
                />
              </div>
            </div>
          </div>
        </div>
      </SectionContent>
    </>
  );
}

function DetailOriented() {
  return (
    <header className={clsx('mb-8')}>
      <SectionTitle
        title="Keen Eye for Spotting Small Details."
        caption="Detail Oriented"
        description="Awareness to ease of access, User Interface consistency, and improved User Experience."
      />
    </header>
  );
}

function PrettyOptimized() {
  return (
    <header className={clsx('mb-8')}>
      <SectionTitle
        title="Comprehensible and Optimized Code."
        caption="Pretty & Optimized"
        description="Writing clean code is a top priority while keeping it as optimized as possible."
      />
    </header>
  );
}



export default function Page() {
  return (
    <section>

      <header
        id="page-header"
        className={clsx(
          'background-grid background-grid--fade-out pt-36 pb-20',
          'lg:pb-28 lg:pt-52'
        )}
      >
        <div className={clsx('content-wrapper')}>
          <div className={clsx('relative')}>
            <Hero />
          </div>
          <div className={clsx('mt-20 lg:mt-36')}>
            <HeaderTechStack />
          </div>
        </div>
      </header>

      <div className={clsx('hidden', 'lg:-mt-16 lg:mb-24 lg:block')}>
        <FeaturedCardSection />
      </div>
      <div className={clsx('-mt-12 mb-12', 'md:mt-0 md:mb-24')}>
        <QuoteSection />
      </div>
      <section className={clsx('mb-12', 'lg:mb-24')}>
        <CleanIntuitive />
      </section>
      <section className={clsx('mb-12', 'lg:mb-24')}>
        <DetailOriented />
      </section>
      <section className={clsx('mb-12', 'lg:mb-24')}>
        <PrettyOptimized />
      </section>


    </section>
  );
}
