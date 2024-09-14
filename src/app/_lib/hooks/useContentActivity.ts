"use client"

import useSWR from 'swr';

import fetcher from '@/app/_lib/utils/fetcher';

import type { TContentActivity } from '@/app/_lib/utils/types';

export default function useContentActivity() {
  const {
    data,
    error: isError,
    isLoading,
  } = useSWR<TContentActivity[]>('/api/activity', fetcher, {
    fallbackData: [],
  });

  return {
    isLoading,
    isError,
    data,
  };
}
