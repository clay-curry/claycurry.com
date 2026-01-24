'use client'

import type { ReactNode } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/lib/components/ui/tabs'
import { cn } from '@/lib/utils'

type ExampleTabsProps = {
  children: ReactNode
  className?: string
}

export function ExampleTabs({ children, className }: ExampleTabsProps) {
  return (
    <Tabs defaultValue="rendered" className={cn('my-6', className)}>
      <div className="flex flex-col py-2 overflow-hidden rounded-xl border border-sidebar-border bg-sidebar">
        <TabsList variant="line" className="px-4">
          <TabsTrigger value="rendered" className="text-sm rounded-lg hover:bg-accent">
            Rendered
          </TabsTrigger>
          <TabsTrigger value="source" className="text-sm rounded-lg hover:bg-accent">
            Source
          </TabsTrigger>
        </TabsList>
        {children}
      </div>
    </Tabs>
  )
}

type ExampleTabProps = {
  children: ReactNode
  className?: string
}

function ExampleTab({ children, className }: ExampleTabProps) {
  return (
    <div className={cn('p-4 bg-background rounded-2xl', className)}>
      {children}
    </div>
  )
}

export function RenderedContent({ children }: { children: ReactNode }) {
  return (
    <TabsContent value="rendered" className="mt-0">
      <ExampleTab>{children}</ExampleTab>
    </TabsContent>
  )
}

export function SourceContent({ children }: { children: ReactNode }) {
  return (
    <TabsContent value="source" className="mt-0">
      <ExampleTab className="[&>pre]:my-0 [&>pre]:border-0">{children}</ExampleTab>
    </TabsContent>
  )
}
