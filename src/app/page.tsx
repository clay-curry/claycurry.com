"use client"

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

function Hero() {

  const HeroCta = ({
    isFree = true,
    isFreeAnimationDuration = 4,
  }: {
    isFree?: boolean;
    isFreeAnimationDuration?: number;
  }) => {
    const shouldReduceMotion = useReducedMotion();

    const animation = {
      hide: {
        x: -16,
        opacity: 0,
      },
      show: {
        x: 0,
        opacity: 1,
      },
    };

    const LetsWorkTogetherButton = () =>
      <Link
        href="/work/contact"
        className={clsx('button min-w-[128px]', 'md:button--big')}
      >
        Lets work together
      </Link>

    const ButtonResume = () =>
      <a
        target="_blank"
        rel="noreferrer nofollow"
        href="https://www.figma.com/community/file/1176377524040948926"
        className={clsx('button button--ghost px-2', 'md:button--big md:px-2')}
      >
        <DocumentIcon className={clsx('h-5 w-5')} />
        RESUME
      </a>


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
        AVAILABLE FOR HIRE
      </div>


    let isFreeVariants = {
      hide: {
        x: 0,
        opacity: 1,
      },
      show: {
        x: shouldReduceMotion ? 0 : -48,
        opacity: 0,
      },
    };

    return (
      <m.div className={clsx('flex gap-2')} initial="hide" animate="show">
        <m.div
          className={clsx('relative z-20')}
          variants={animation}
          transition={{ delay: 0.4 }}
        >
          <LetsWorkTogetherButton />
        </m.div>
        {isFree ? (
          <m.div
            variants={animation}
            transition={{ delay: 2.8 }}
            className={clsx('relative z-10')}
          >
            <m.div
              variants={isFreeVariants}
              transition={{ delay: isFreeAnimationDuration + 1.5, duration: 0.4 }}
            >
              <AvailableForHire />
            </m.div>
            <m.div
              className={clsx('absolute top-0 left-0')}
              initial={{ x: -48, opacity: 0, pointerEvents: 'none' }}
              animate={{ x: 0, opacity: 1, pointerEvents: 'auto' }}
              transition={{ delay: isFreeAnimationDuration + 1.6, duration: 0.4 }}
            >
              <ButtonResume />
            </m.div>
          </m.div>
        ) : (
          <m.div variants={animation} transition={{ delay: 0.5 }}>
            <ButtonResume />
          </m.div>
        )}
      </m.div>
    );
  }

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

  function HeaderImageAnimation({
    onAnimationComplete = () => { },
  }: {
    onAnimationComplete?: () => void;
  }) {

    const animation = {
      hide: { pathLength: 0.3 },
      show: (i) => {
        const delay = 0.6 + i * 0.1;
        return {
          pathLength: 1,
          transition: {
            pathLength: { delay, duration: 1 },
          },
        };
      },
    };


    return (
      <m.svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 457 526"
        fill="none"
        initial="hide"
        animate="show"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={clsx(
          'stroke-accent-500 h-[526px] w-[457px] opacity-60',
          'dark:opacity-40'
        )}
        onAnimationComplete={onAnimationComplete}
      >
        <m.path
          variants={animation}
          custom={4}
          d="m167.8 23c2.3 0 8.8 1.5 14.4 3.4 5.7 1.8 14.3 5.5 19.3 8.1 4.9 2.6 11.7 6.6 15 8.8 3.3 2.3 11 9.1 17.2 15.2 10.3 10.1 11.3 11.5 12.8 17 1 3.3 3.2 8.5 5 11.5 1.7 3 4.8 8.4 6.7 12 2 3.6 7.5 14.2 12.3 23.5 4.8 9.3 10 18.5 11.6 20.3 1.6 1.7 2.9 3.8 2.9 4.4 0.1 0.7 5.3 8.2 11.8 16.6 6.4 8.4 11.8 15.3 11.9 15.2 0.2 0 3.3-0.8 7-1.7 4.4-1 11-1.6 18.8-1.7 8.2 0 14.1 0.6 18.5 1.7 3.6 1 9.9 3.4 14 5.3 4.1 2 10.2 5.5 13.5 7.9 3.3 2.3 8.6 7 11.7 10.4 3.6 3.7 7.1 8.9 9.2 13.3 1.9 4 4.2 10 5.1 13.3 0.8 3.3 1.8 11.6 2.2 18.5 0.4 8.2 0.2 15.2-0.6 20.5-0.7 4.4-2.4 11.6-3.8 16-1.4 4.4-4.4 11.6-6.7 16-2.3 4.4-6.2 10.7-8.8 14-2.5 3.3-6.5 8-8.9 10.5-2.4 2.5-6 5.9-7.9 7.5-2 1.7-3.9 3.9-4.2 5-0.3 1.1 0.5 6.1 1.8 11 1.4 4.9 2.8 13.1 3.1 18 0.5 8.8 0.4 9.4-4 22.5-2.5 7.4-7.2 20.9-10.5 30-3.3 9.1-8.1 21.9-10.7 28.5-2.6 6.6-6.4 15.4-8.5 19.5-2.1 4.1-5.4 10-7.4 13-2 3-7.4 13.1-12 22.5-4.6 9.4-11.3 23.7-14.9 32-3.5 8.2-8.3 20.6-10.5 27.5-2.3 6.9-5.7 18.1-7.6 25-2 7.4-5.1 15.6-7.5 20-2.2 4.1-4.1 7-4.1 6.5 0-0.5 2.1-9.1 4.6-19 2.5-9.9 6.6-24.4 9-32.3 2.4-7.8 7.8-22.2 12-32 4.1-9.7 11.2-24.9 15.8-33.7 4.5-8.8 9.7-18.3 11.6-21 1.9-2.8 5.3-9.1 7.6-14 2.3-4.9 7.1-16.6 10.7-26 3.5-9.4 9.4-25.6 13-36 3.6-10.4 7.1-21 7.7-23.5 0.9-3.4 0.9-6.4 0-12.5-0.6-4.4-1.9-10.6-2.8-13.9-1-3.3-2.5-6.2-3.5-6.7-1.2-0.7-3.5 0.1-8 2.5-3.4 1.9-9.1 4.4-12.7 5.6-3.6 1.2-8.8 2.6-11.5 3.1-2.8 0.5-10.2 1-16.5 1-8.4 0-13.6-0.6-19.5-2.1-4.4-1.2-11.6-4-16-6.3-5.7-3-10.3-6.5-16.1-12.2-4.5-4.4-9.7-10.9-11.8-14.5-2.1-3.6-5-10.1-6.6-14.5-1.7-4.9-3.2-11.9-3.8-18-0.7-6.6-0.7-13.1-0.1-19 0.5-4.9 1.6-11.5 2.4-14.5 0.8-3 2.4-8 3.6-11 1.1-3 3.2-7.8 4.6-10.5 1.4-2.8 4.4-7.7 6.7-11 2.2-3.3 5.3-7.5 6.8-9.3 1.6-1.8 2.5-3.7 2.1-4.5-0.4-0.6-6.4-9.5-13.4-19.7-7-10.2-13.5-19.2-14.6-20.1-1-0.9-7.7-5.6-14.8-10.4-7.2-4.9-17.3-11.8-22.5-15.4-5.2-3.5-12.9-8.8-17-11.6-4.1-2.9-20.1-13.7-35.5-24-15.4-10.3-30.7-20.1-34-21.6-3.3-1.6-7-2.9-8.3-2.9-1.3 0-2.5 0.8-3 2-0.5 1.5-1.2 1.9-2.7 1.4-1.1-0.4-2.2-0.8-2.5-1-0.3-0.2 0.3-2.8 1.3-5.7 1-2.8 2.9-6.9 4.3-8.9 1.3-2.1 4.1-4.9 6.1-6.3 3.2-2.2 4.9-2.6 17.3-2.5l10.5-7.3c9-6.2 10.5-7.6 10.5-9.9 0-1.6 0.9-4.5 1.9-6.5 1.1-2.1 3.2-5 4.8-6.6 1.5-1.5 4.6-3.4 6.8-4.2 2.2-0.8 5.9-1.4 8.2-1.5zm-12.1 8.8c-1 0.9-2.5 3.3-3.3 5.2-0.8 1.9-1.3 3.6-1.1 3.6 0.2 0.1 4.6-2.7 9.8-6.2 9-6.1 9.3-6.4 6-6.3-1.9 0-4.9 0.5-6.5 1-1.7 0.5-3.8 1.7-4.9 2.7zm-49.1 36.5c-1.1 1.5-1.7 2.9-1.3 3.2 0.5 0.3 3.5-1.4 6.8-3.8 3.4-2.3 6.1-4.3 6-4.5 0-0.1-0.6-0.2-1.3-0.2-0.6 0.1-2.8 0.6-4.7 1.3-1.9 0.7-4.3 2.5-5.5 4zm167.7 99.5c-1 0.5 0.1 2.9 4.2 8.9 3.6 5.3 6.3 8.3 7.4 8.3 1 0 2.3-0.6 3-1.3 0.7-0.6 1.2-1.9 1.2-2.7 0-0.8-2.2-5-4.9-9.3-2.6-4.2-5-7.7-5.2-7.7-0.2 0-1.3 0.8-2.4 1.6-1.1 0.8-2.6 1.8-3.3 2.2z"
        />
        <m.path
          variants={animation}
          custom={1}
          d="m303.3 3c0.4 0 2.2 0.7 3.9 1.6 1.8 0.9 6.3 2.5 10 3.5 3.8 1.1 9.8 3.3 13.5 4.9 3.8 1.7 9.5 3.7 12.8 4.5 3.3 0.7 6.2 1.2 6.5 1 0.3-0.3-1.3-1.5-3.5-2.7-2.8-1.6-3.5-2.4-2.3-2.5 1-0.2 5.4 1.5 9.8 3.7 4.4 2.2 9.6 5.5 11.6 7.3 1.9 1.7 3.7 3.9 3.9 4.7 0.2 0.8 2.6 2.1 5.2 2.8 2.6 0.8 6.5 2.2 8.5 3.3 2.1 1 3.8 2 3.8 2.1 0 0.2-2.6 0.2-11.5-0.3l7 3.4c4 2 8.9 5.4 11.5 8.1 2.5 2.5 4 4.6 3.5 4.7-0.6 0-1.7-0.8-2.5-1.7-0.8-0.9-3.4-3-5.8-4.5-2.3-1.6-4.8-2.9-5.5-2.9-0.6 0-0.1 0.7 1.3 1.6 1.4 0.9 5.2 4.4 8.5 7.6 5.1 5.1 6.6 6 10.5 6.5 2.5 0.2 5.2 0.9 6 1.4 1.1 0.8 0.8 0.9-1.3 0.5-1.6-0.4-2.5-0.2-2.2 0.4 0.3 0.5-0.4 1-1.5 1-1.7 0-1.2 0.9 2.7 5.3 2.7 3 6.6 8.7 8.7 12.8 2.2 4.1 5.2 8.6 6.8 10.2 1.5 1.5 2.8 3.2 2.8 3.7 0 0.5-0.6 1-1.3 1-0.6 0-1.8-1.1-2.5-2.5-0.6-1.4-1.7-2.5-2.2-2.5-0.6 0 0.1 2.3 1.5 5 1.4 2.8 2.9 5 3.5 5 0.6 0 0.7 0.8 0.4 1.8-0.3 1 0.7 3.2 2.6 5.7 1.8 2.2 4.1 5.7 5.1 7.8 1 2 1.8 4 1.7 4.5-0.1 0.4 0.6 2 1.7 3.7 1.9 2.7 2 4.8 2.1 30 0 14.8 0.3 29.5 0.7 32.5 0.5 3.1 0.4 6.8-1.1 11.5l-0.2-3q-0.2-3-1.5 3.5c-0.7 3.6-2.9 10.3-5 15-2.1 4.7-4.1 10.4-4.4 12.7-0.3 2.3-0.9 4-1.4 3.7-0.4-0.2-0.8 1.3-0.8 3.4-0.1 3.7-0.1 3.7-0.9 0.7-0.6-2.4-0.8-2.6-0.9-0.7 0 1.2-0.4 3-0.8 4-0.6 1.5-0.7 1.5-1.3-0.3-0.5-1.6-1.7-0.1-6.3 7.5-4 6.7-5.7 10.5-5.7 13 0 1.9-0.7 7.3-1.6 12-0.9 4.7-2.9 12.1-4.5 16.5-1.6 4.4-4.6 10.9-6.6 14.5-2 3.6-4.2 7.2-5 8-1.2 1.3-0.8 2.3 2.3 7 2 3 5.5 7.8 7.7 10.7 3.2 3.8 5.2 5.4 8.2 6.2 2.2 0.5 6 1.9 8.5 2.9 2.5 1.1 5.6 2.9 7 4.1 1.4 1.2 5.6 3.1 9.5 4.3 3.9 1.1 10.5 4.1 22.5 11.3v170.5h-170l0.3-12.7c0.2-11.7 0.5-13.2 2.8-17.3 1.5-2.5 2.9-5.7 3.3-7.2 0.3-1.6 1.3-10.8 2.1-20.5 1.4-16.7 1.4-17.9-0.3-19.7-0.9-1-7.6-6.6-14.7-12.4-8.1-6.5-15.6-11.7-20-13.7-3.9-1.7-8.5-4.4-10.3-5.8-1.7-1.5-3.5-2.7-4-2.7-0.4 0-7.9 4.2-16.7 9.2-8.8 5.1-18 10-20.5 10.9-2.5 0.9-8.1 2.3-12.5 2.9-5.8 0.9-9.1 1-12 0.2-2.2-0.6-6.2-2.6-9-4.4-2.7-1.8-6.3-5.1-8-7.3-2-2.6-4.1-7.6-6-14.4-3-10.3-3-10.4-8-13.6-3.8-2.5-5.5-4.5-7.3-8.4-1.2-2.8-2.2-6.3-2.2-7.8 0-2.3-0.5-2.9-3-3.5-2.2-0.6-4-2.4-7-7-3.7-6-3.9-6.6-3.2-11.9 0.5-3.9 0.3-6.1-0.6-7.3-1.1-1.5-1.5-1.5-5-0.1-2 0.9-5.4 1.5-7.5 1.5-2 0-5.1-0.7-6.7-1.5-1.7-0.8-3.8-2.7-4.9-4.2-1-1.6-2.1-4-2.5-5.5-0.3-1.6-0.1-6.3 0.5-10.5 0.6-4.3 1.2-16.4 1.4-26.8 0.3-15.1 0-19.5-1.1-21.2-0.8-1.3-1.9-2.1-2.4-1.8-0.6 0.3-1-0.2-1-1 0-0.8-0.5-1.5-1-1.5-0.6 0-1.1 1.5-1.2 6.5l-0.7-3.5c-0.4-1.9-2.1-4.9-3.7-6.6-1.9-2-4.9-3.7-8.7-4.8-3.1-0.9-7.1-1.6-8.7-1.6-1.7 0-4.3-1.1-9-5l-4.8 3.8c-2.6 2.2-6.2 4.6-8 5.5-1.7 1-3.4 1.6-3.7 1.5-0.3-0.2 1.2-1.5 3.2-2.9 2.1-1.5 4.6-4.1 5.5-5.8 1-1.7 1.5-3.1 1-3.1-0.4 0-2.6 1.3-5 3-2.3 1.6-4.4 3-4.7 3-0.3 0-0.3-0.4 0-1 0.3-0.6-0.8-0.8-2.8-0.5-1.9 0.4-0.6-0.5 3.3-2 3.6-1.3 7.2-3.2 8-4 1.3-1.3 1.2-1.5-0.8-1.5-1.2 0-2.1-0.5-2-1.1 0.2-0.6-0.3-1.3-1-1.5-0.6-0.2-1.5 0.4-1.8 1.4-0.3 0.9-0.8 2.4-1 3.2-0.4 1.1-0.7 1.2-1.2 0.2-0.5-0.9-1.5-0.9-4.2 0.4-1.9 1-4.8 2.7-6.4 3.8-2.1 1.5-3.1 1.7-3.3 0.9-0.2-0.7-1.5-1.3-3.1-1.4-2.1 0-1.5-0.5 2.8-2 3-1.1 7.1-3 9-4.1 3.2-2 3.3-2.2 1.5-2.9-1.1-0.3-2.3-0.5-2.8-0.3-0.4 0.2-0.9 0-1.2-0.6-0.3-0.6-1.2-0.8-2-0.5-0.8 0.3-1.5 0.1-1.5-0.5q0-1-2.5 0c-1.4 0.6-2.5 0.7-2.5 0.3 0-0.5-0.7 0.1-1.5 1.2-1.4 1.8-1.5 1.8-1.5 0.3 0-1-0.3-1.8-0.8-1.8-0.4 0-1.5 0.6-2.4 1.3-1 0.7-2.4 3.5-4.6 11.2l-0.1-3.7c-0.1-2.1-0.6-3.8-1.1-3.8-0.6 0-2.2-1.1-6.5-5.1l3.5 0.1c1.9 0 5-0.4 6.7-1 1.8-0.5 3.2-1.6 3-2.2-0.2-0.8-3-1.5-7.3-1.9-4.1-0.3-5.3-0.6-2.9-0.7 2.2-0.1 3.7-0.4 3.2-0.7-0.4-0.3-1-0.5-1.5-0.5-0.4-0.1-1.7-0.8-3-1.5-1.2-0.8-2.9-1.3-3.7-1-0.8 0.3-1.5 0.1-1.5-0.5 0-0.6-1.9-1.4-4.3-1.9-2.3-0.6-5.3-2.1-6.7-3.6-1.4-1.4-2.3-2.5-2-2.5 0.3 0 2.4 0.9 4.7 2 2.4 1.1 5.5 2 7 2 1.6 0 3.8-0.2 5-0.5 1.3-0.3 2.3-0.9 2.3-1.5 0-0.6-2.4-1-5.3-1-3.5 0.1-5.7-0.4-6.7-1.5-0.8-0.9-2.2-1.6-3-1.5-1.1 0-1.6-1.2-2-8.5l2.5 2.8c1.4 1.5 2.9 2.7 3.5 2.7 0.5 0 1-0.4 1-1 0-0.6-1-1.7-2.3-2.5-1.9-1.3-2-1.7-0.7-2.5 0.8-0.5 1.7-1 2-1 0.3 0 1.6 1.1 3 2.5 1.4 1.4 3.2 2.5 4 2.5 0.8 0 2.2-0.5 3-1.1 1.2-0.8 0.9-1-1.4-0.7-2 0.2-3.2-0.3-4.1-1.7-0.8-1.1-1.7-3.3-2-5-0.7-3-0.7-3 1.9 0.8 1.4 2 2.8 3.7 3.1 3.7 0.3 0 1.2-0.2 2-0.5 1.1-0.4 1.4-1.5 1-4.7-0.5-3.9-0.4-4.1 0.7-2 0.7 1.2 1.6 2.2 2 2.2 0.5 0 1.5-1.7 2.4-3.7 0.8-2.1 1.9-7.4 2.3-11.8 0.4-4.4 0.6-8.8 0.4-9.7-0.2-1-0.8-1.8-1.3-1.8-0.6 0-1 1.5-1.1 3.3-0.1 3.1-0.1 3.1-1 0.7-0.7-2-0.8-1.7-0.4 1.5 0.3 3.3 0.2 3.7-0.8 2.3-0.7-1-1.5-1.7-2-1.8-0.4 0-0.7 1.2-0.7 2.8 0 2-0.3 2.3-0.9 1.2-0.7-1.1-1-0.5-1.5 2.3-0.3 2-0.4 5.4-0.1 7.5 0.3 2.1 0.2 2.9-0.2 1.9-0.5-1-1.3-1.7-1.8-1.5-0.6 0.2-1.1-2.3-1.3-5.9-0.1-3.5-0.7-6.3-1.2-6.3-0.6 0-1.2 0.6-1.4 1.3-0.3 0.6-0.5-0.6-0.8-6.8l-2.7 6v-3.5c-0.1-1.9 1-5.9 2.4-8.7 1.9-4 2.5-6.8 2.3-11 0-3.2 0.2-7.7 0.5-10 0.4-2.4 0.4-4.3-0.1-4.3-0.4 0-1.7 1-3 2.3-1.2 1.2-2.3 1.8-2.3 1.2 0-0.6 1.9-2.8 4.3-4.9 2.4-2.2 5.7-6.5 7.3-9.5 1.7-3.1 3.7-6.7 4.5-8.1 0.8-1.4 1.8-2.7 2.2-3 0.4-0.3 2.5-3 4.8-6 2.2-3 4-5.9 4-6.5 0-0.6-1.1 0.1-2.6 1.5-1.5 1.4-3.5 4.3-4.5 6.5-1 2.2-1.9 3.3-1.9 2.5 0-0.9-0.6-0.5-1.5 1-0.7 1.4-1.7 2.3-2.2 2.2-0.4-0.2-1.3 1.1-1.9 3-1.1 3.1-1.2 3.2-1.6 0.8-0.2-1.5 0.9-5.2 2.9-9.2 1.8-3.8 3.3-7.1 3.3-7.5-0.1-0.5-1.6 1-3.5 3.2-1.9 2.2-3.5 3.4-3.5 2.8 0-0.7 2.6-4.1 5.8-7.5 3.2-3.5 7.9-9.2 10.4-12.8 2.5-3.6 7.4-9.3 10.9-12.7 4.8-4.6 8.8-7.3 16.1-10.7 5.4-2.5 15.3-6.2 22-8.2 6.8-1.9 12.6-4.1 13-4.7 0.4-0.7 0.8-1.9 0.8-2.7 0-0.8 1.1-3.8 2.3-6.5 1.3-2.8 3.9-6.4 5.8-8.1 1.9-1.6 5.2-3.6 7.4-4.3 2.3-0.8 5.7-1.1 8-0.7 3.7 0.5 4.7 0.1 14.5-6.7 10.1-7 10.5-7.5 11.3-11.8 0.4-2.4 1.5-5.8 2.5-7.4 1-1.6 3.8-4.4 6.1-6 3.3-2.3 5.7-3.1 10-3.4 3.4-0.2 8.4 0.4 12.8 1.5 5.8 1.5 7.5 1.6 8.5 0.7 0.9-1 0.7-1.3-1.3-1.3-1.8-0.1-2.1-0.3-0.9-1 0.8-0.4 5.1-1.2 9.5-1.6 4.4-0.4 11.6-1.7 16-3 7-2 7.5-2.3 4.1-2.3-2.2-0.1-3.6-0.4-3.2-0.9 0.4-0.4 3.5-0.6 6.9-0.5 3.5 0.1 9.2-0.6 13.2-1.7 3.8-1 6.1-1.9 5-2-1.1-0.1 1.6-0.8 6-1.6 4.4-0.7 14.3-1.8 22-2.4 7.7-0.6 14.7-1.4 15.5-1.7 0.8-0.4 6-0.5 11.5-0.4 5.5 0.1 10.8 0.4 11.7 0.7 1.3 0.3 1.6 0 1.1-1.1-0.3-0.8-0.3-1.5 0-1.5zm-146.3 27.8c-1.4 1-3.3 3.3-4.3 5.1-0.9 1.7-1.5 3.3-1.2 3.6 0.3 0.3 4-1.8 8.3-4.6 4.2-2.9 8.1-5.5 8.7-5.9q1-0.8-0.1-1.2c-0.7-0.2-2.9-0.1-5 0.3-2.2 0.4-5 1.6-6.4 2.7zm-50.2 37.5c-1 1.2-1.8 2.5-1.8 2.9 0 0.5 0.8 0.4 1.8-0.1 0.9-0.5 4-2.6 6.7-4.5 3.6-2.6 4.4-3.6 3-3.6-1.1 0-3.3 0.7-5 1.6-1.7 0.8-3.8 2.5-4.7 3.7z"
        />
      </m.svg>
    );
  }

  function HeaderImage() {
    const controlsHeaderImage = useAnimationControls();
    const controlsHeaderOutline = useAnimationControls();

    return (
      <div
        className={clsx('relative h-[590px] w-[603px]')}
        style={{
          maskImage: `url("data:image/svg+xml,%3Csvg width='603' height='590' fill='none' viewBox='0 0 603 590' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m0 0v393h228v9.5c0 103.55 83.947 187.5 187.5 187.5s187.5-83.947 187.5-187.5v-402.5h-603z' fill='%23000'/%3E%3C/svg%3E%0A")`,
          WebkitMaskImage: `url("data:image/svg+xml,%3Csvg width='603' height='590' fill='none' viewBox='0 0 603 590' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m0 0v393h228v9.5c0 103.55 83.947 187.5 187.5 187.5s187.5-83.947 187.5-187.5v-402.5h-603z' fill='%23000'/%3E%3C/svg%3E%0A")`,
        }}
      >
        <div
          className={clsx(
            'from-accent-400/20 via-accent-400/0 absolute top-0 right-0 h-[590px] w-[375px] rounded-full bg-gradient-to-t',
            'dark:from-accent-600/10 dark:via-accent-600/0'
          )}
        >
          <div className={clsx('absolute right-0 bottom-0 overflow-hidden')}>
            <m.div
              className={clsx('absolute z-[10]')}
              initial={{ opacity: 1 }}
              animate={controlsHeaderOutline}
            >
              <HeaderImageAnimation
                onAnimationComplete={() => {
                  controlsHeaderOutline.start({
                    opacity: 0,
                    transition: {
                      duration: 0.2,
                      delay: 0.15,
                    },
                  });

                  controlsHeaderImage.start({
                    opacity: 1,
                    transition: {
                      duration: 0.15,
                    },
                  });
                }}
              />
            </m.div>
            <m.div
              className={clsx('')}
              initial={{ opacity: 0 }}
              animate={controlsHeaderImage}
            >
              <Image
                alt="Clay Curry Illustration"
                src="/assets/images/me.png"
                width={457}
                height={526}
                className={clsx(
                  'hidden max-w-none',
                  'lg:block',
                  'dark:brightness-[.82]'
                )}
                quality={100}
                priority
              />
            </m.div>
          </div>
        </div>
      </div>
    );
  }

  function HeaderTitle() {
    const controls = useAnimationControls();


    const animation = {
      hide: { x: -32, opacity: 0 },
      show: {
        x: 0,
        opacity: 1,
      },
    };


    return (
      <div>
        <m.div
          className={clsx(
            'mb-1 flex items-center gap-1 text-2xl text-slate-600',
            'md:mb-0 md:gap-2 md:text-4xl',
            'dark:text-slate-400'
          )}
          initial={animation.hide}
          animate={animation.show}
          transition={{ delay: 0.1 }}
        >
          hi!
          <m.div
            initial={{
              opacity: 0,
              y: 16,
              rotate: 30,
              transformOrigin: 'right center',
            }}
            animate={controls}
            transition={{
              type: 'spring',
              delay: 0.35,
              bounce: 0.7,
              duration: 0.7,
            }}
          >
            <Image
              className={clsx('w-7 md:w-10')}
              alt="Love-you Gesture"
              src="/assets/emojis/love-you-gesture.png"
              width={48}
              height={48}
              onLoad={() => {
                controls.start({
                  opacity: 1,
                  y: 0,
                  rotate: 0,
                });
              }}
              priority
            />
          </m.div>
        </m.div>
        <span className={clsx('text-slate-700', 'dark:text-slate-300')}>
          <m.span
            className={clsx(
              'mb-4 block text-[2.5rem] font-[1000] leading-none',
              'md:mb-6 md:text-7xl'
            )}
            initial={animation.hide}
            animate={animation.show}
            transition={{ delay: 0.2 }}
          >
            I&apos;m{' '}
            <strong className={clsx('text-accent-600', 'dark:text-accent-500')}>
              Clay
            </strong>{' '}
            Curry,{' '}
          </m.span>
          <m.h1
            className={clsx(
              'block text-base text-slate-600',
              'md:text-xl',
              'dark:text-slate-400'
            )}
            initial={animation.hide}
            animate={animation.show}
            transition={{ delay: 0.3 }}
          >
            <span className={clsx('lowercase')}>A</span>{' '}
            <strong
              className={clsx(
                'font-bold lowercase text-slate-700',
                'dark:text-slate-300'
              )}
            >
              builder
            </strong>{' '}
            skilled in UI design, programming language design,{' '}
            <span className={clsx('block')}>
              visual analytics, and system observability.
            </span>
          </m.h1>
        </span>
      </div>
    );
  }

  return (
    <header
      id="page-header"
      className={clsx(
        'background-grid background-grid--fade-out pt-36 pb-20',
        'lg:pb-28 lg:pt-52'
      )}
    >
      <div className={clsx('content-wrapper')}>
        <div className={clsx('relative')}>
          <div className={clsx('relative z-10')}>
            <HeaderTitle />
          </div>
          <div className={clsx('mt-6 md:mt-8')}>
            <HeroCta isFree={false} />
          </div>
          <div className={clsx('mt-20 lg:mt-36')}>
            <HeaderTechStack />
          </div>
          <div
            className={clsx(
              'pointer-events-none absolute -top-36 right-0 z-0 hidden select-none',
              'lg:block'
            )}
          >
            <HeaderImage />
          </div>
        </div>
      </div>
    </header>
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

      <Hero />

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
