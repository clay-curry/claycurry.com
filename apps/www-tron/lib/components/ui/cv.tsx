import Link from 'next/link'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/**
 * CV-specific typography and layout primitives
 * TRON-themed styling with neon glow effects
 */

// Typography primitives
export function CVText({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span className={cn('text-muted-foreground', className)}>{children}</span>
  )
}

export function CVLabel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span className={cn('font-bold text-foreground', className)}>
      {children}
    </span>
  )
}

export function CVLink({
  href,
  children,
  className,
}: {
  href: string
  children: ReactNode
  className?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        'text-primary hover:text-primary/80 underline underline-offset-4 decoration-primary/50 transition-colors',
        className
      )}
    >
      {children}
    </Link>
  )
}

// Layout primitives for accordion content
export function CVContentBody({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('mt-3 text-foreground', className)}>
      <div className="border bg-card border-primary/10 rounded-2xl my-0.5 px-4 py-4 space-y-4">
        {children}
      </div>
    </div>
  )
}

// Row component for key-value pairs
export function CVRow({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col text-foreground sm:flex-row sm:justify-between',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CVRowItem({
  label,
  children,
  className,
}: {
  label: string
  children?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-6 flex flex-col md:flex-row', className)}>
      <CVLabel>{label}:&nbsp;&nbsp;</CVLabel>{children}
    </div>
  )
}

// Bullet list for experience items with timeline-style left border
export function CVBulletList({
  items,
  className,
}: {
  items: ReactNode[]
  className?: string
}) {
  return (
    <div className={cn('mt-2', className)}>
      {items.map((item, index) => (
        <div key={index} className="flex gap-3">
          {/* Left column: dot and line */}
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 rounded-full bg-accent-2 shrink-0 mt-1.5" />
            <div className="w-0.5 flex-1 bg-border mb-4" />
          </div>
          {/* Right column: text */}
          <div className={cn(
            'text-sm flex-1 pb-4',
          )}>
            {item}
          </div>
        </div>
      ))}
    </div>
  )
}

// Composite components for common patterns
export function CVOrgLocation({
  org,
  location,
  className,
}: {
  org: ReactNode
  location: string
  className?: string
}) {
  return (
    <div className={cn('space-y-1', className)}>
      <CVRowItem label="Organization">{org}</CVRowItem>
      <CVRowItem label="Location">{location}</CVRowItem>
    </div>
  )
}

export function CVPositionAdvisor({
  position,
  advisor,
  className,
}: {
  position: string
  advisor?: { name: string; href: string }
  className?: string
}) {
  return (
    <CVRow className={className}>
      <CVRowItem label="Position">{position}</CVRowItem>
      {advisor && (
        <CVRowItem label="Advisor">
          <CVLink href={advisor.href}>{advisor.name}</CVLink>
        </CVRowItem>
      )}
    </CVRow>
  )
}

// Detail block for education/award content
export function CVDetailBlock({
  children,
  proof,
  className,
}: {
  children: ReactNode
  proof?: { label: string; href: string }
  className?: string
}) {
  return (
    <div className={cn('flex justify-between text-foreground', className)}>
      <div className="text-muted-foreground">{children}</div>
      {proof && (
        <span className="text-muted-foreground">
          <CVLink href={proof.href}>{proof.label}</CVLink>
        </span>
      )}
    </div>
  )
}

// Simple text content wrapper
export function CVSimpleContent({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('text-muted-foreground', className)}>{children}</div>
  )
}

// Highlight text (bold, foreground color)
export function CVHighlight({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span className={cn('font-bold text-foreground', className)}>
      {children}
    </span>
  )
}
