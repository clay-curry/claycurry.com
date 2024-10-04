import { getEvents } from '@/data'

import type { Metadata } from 'next'
import type React from 'react'
import { ApplicationLayout } from './application-layout'

export const metadata: Metadata = {
  title: {
    template: '%s - Clay Curry',
    default: 'Clay Curry',
  },
  description: '',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let events = await getEvents()

  return (
      <body  className="text-zinc-950 antialiased lg:bg-zinc-100 dark:bg-zinc-900 dark:text-white dark:lg:bg-zinc-950">
        <ApplicationLayout events={events}>{children}</ApplicationLayout>
      </body>
  )
}
