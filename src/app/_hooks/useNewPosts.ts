"use client"

import useSWR from 'swr';

import fetcher from '@/app/_utils/fetcher';

export default function useNewPosts() {
  const {
    data,
    error: isError,
    isLoading,
  } = useSWR<
    {
      slug: string;
      title: string;
      createdAt: string;
    }[]
  >('/api/content/latest', fetcher, {
    fallbackData: [],
  });

  return {
    isLoading,
    isError,
    data,
  };
}
