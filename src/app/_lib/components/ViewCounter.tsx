"use client"

import useSWR, { useSWRConfig } from 'swr';
import fetcher from '../utils/fetcher';
import { cookies } from 'next/headers';


const incrementView = async (slug: string) => {
  const sessionId = cookies().get('sessionId')

  await fetch('/api/count/view', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ slug, sessionId }),
  });
}

const ViewCounter = ({
  slug,
  trackView,
}: {
  slug: string;
  trackView?: boolean;
}) => {

  const { mutate } = useSWRConfig()
  const { data } = useSWR('/api/count/view', fetcher)

  mutate('/api/count/view', incrementView(slug), {
    optimisticData: slug => ({ ...data[slug], views: data[slug].views + 1 }),
    rollbackOnError: true
  })

  return (
    <p className="text-neutral-600 dark:text-neutral-400">
      {`${data[slug].views.toLocaleString()} views`}
    </p>
  );
}