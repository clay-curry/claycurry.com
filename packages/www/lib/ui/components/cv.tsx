import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * CV-specific typography and layout primitives
 * Uses semantic color tokens for consistent theming
 */

// Typography primitives
export function CVText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("text-muted-foreground", className)}>{children}</span>
  );
}

export function CVLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("font-bold text-foreground", className)}>
      {children}
    </span>
  );
}

export function CVLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "text-link hover:text-link-hover underline underline-offset-4 decoration-link/50",
        className
      )}
    >
      {children}
    </Link>
  );
}

// Layout primitives for accordion content
export function CVContentBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mt-3 text-muted-foreground", className)}>
      <div className="w-8 mx-auto mb-3 border-t border-border" />
      <div className="border-l border-r border-border my-0.5 px-4 py-4 space-y-4">
        {children}
      </div>
    </div>
  );
}

// Row component for key-value pairs
export function CVRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col text-foreground sm:flex-row sm:justify-between",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CVRowItem({
  label,
  children,
  className,
}: {
  label: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("text-muted-foreground mb-6", className)}>
      <CVLabel>{label}:</CVLabel> {children}
    </div>
  );
}

// Bullet list for experience items
export function CVBulletList({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "mt-2 ml-6 space-y-2 text-muted-foreground list-disc",
        className
      )}
    >
      {items.map((item) => (
        <li key={item.slice(0, 50)}>{item}</li>
      ))}
    </ul>
  );
}

// Composite components for common patterns
export function CVOrgLocation({
  org,
  location,
  className,
}: {
  org: ReactNode;
  location: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <CVRowItem label="Organization">{org}</CVRowItem>
      <CVRowItem label="Location">{location}</CVRowItem>
    </div>
  );
}

export function CVPositionAdvisor({
  position,
  advisor,
  className,
}: {
  position: string;
  advisor?: { name: string; href: string };
  className?: string;
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
  );
}

// Detail block for education/award content
export function CVDetailBlock({
  children,
  proof,
  className,
}: {
  children: ReactNode;
  proof?: { label: string; href: string };
  className?: string;
}) {
  return (
    <div className={cn("flex justify-between text-foreground", className)}>
      <div className="text-muted-foreground">{children}</div>
      {proof && (
        <span className="text-muted-foreground">
          <CVLink href={proof.href}>{proof.label}</CVLink>
        </span>
      )}
    </div>
  );
}

// Simple text content wrapper
export function CVSimpleContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("text-muted-foreground", className)}>{children}</div>
  );
}

// Highlight text (bold, foreground color)
export function CVHighlight({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("font-bold text-foreground", className)}>
      {children}
    </span>
  );
}
