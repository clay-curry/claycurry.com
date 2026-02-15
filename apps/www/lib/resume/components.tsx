"use client";

import { cva } from "class-variance-authority";
import { Wrench } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Accordion } from "@/lib/components/ui/accordion";
import { aboutData } from "@/lib/portfolio-data";
import { cn } from "@/lib/utils";

// TRON-styled link component
export const PrimaryLink = ({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) => (
  <Link
    href={href}
    className="text-primary underline underline-offset-4 decoration-primary/50 hover:text-primary/80 transition-colors"
  >
    {children}
  </Link>
);

// TRON Card with glow effect
export const ResumeCard = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={cva(
      "w-full mt-10 md:mt-14 p-2 md:p-4 rounded-xl bg-secondary border border-border/65",
    )({ className })}
  >
    {children}
  </div>
);

// Skill chip
export const SkillChip = ({ children }: { children: ReactNode }) => (
  <span className="px-3 py-1.5 text-sm font-mono bg-secondary rounded-lg border border-border">
    {children}
  </span>
);

// Header compound components
export const HeaderSection = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "flex flex-col gap-2 w-full py-16 tracking-tight text-center",
      className,
    )}
  >
    {children}
  </div>
);

export const HeaderName = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <h1
    className={cn(
      "text-3xl font-bold md:text-4xl lg:text-5xl text-foreground text-shadow-none",
      className,
    )}
  >
    {children}
  </h1>
);

export const HeaderTitle = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <p className={cn("mt-4 text-muted-foreground text-md md:text-lg", className)}>
    {children}
  </p>
);

export const HeaderSocialLinks = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "mt-4 flex items-center justify-center gap-[1.125rem]",
      className,
    )}
  >
    {children}
  </div>
);

export const HeaderSocialLink = ({
  icon,
  href,
  label,
  clickId,
  className,
}: {
  icon: ReactNode;
  href: string;
  label: string;
  clickId?: string;
  className?: string;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    data-click-id={clickId}
    className={cn(
      "inline-flex items-center justify-center size-9 rounded-xl border border-border text-foreground bg-muted hover:bg-muted/80 transition-colors",
      className,
    )}
    aria-label={label}
  >
    {icon}
  </a>
);

// Section heading with TRON accent
export const SectionHeading = ({
  children,
  icon,
}: {
  children: ReactNode;
  icon?: ReactNode;
}) => (
  <div className="flex items-center gap-2 md:gap-3 my-3 border-b border-primary/30 pb-2">
    {icon}
    <h2 className="text-xl font-semibold md:text-2xl text-foreground text-shadow-none">
      {children}
    </h2>
  </div>
);

// Accordion trigger header with title and date
export const AccordionHeader = ({
  title,
  date,
}: {
  title: string;
  date: string;
}) => {
  const dateParts = date.split(/\s*[–-]\s*/);

  return (
    <>
      <span className="flex-1 text-left text-card-foreground hover:text-primary">
        {title}
      </span>
      <span className="font-normal leading-tight text-center text-primary shrink-0 md:text-right md:leading-normal">
        {dateParts.length > 1 ? (
          <>
            <span className="block whitespace-nowrap md:inline">
              {dateParts[0]}
            </span>
            <span className="hidden md:inline"> – </span>
            <span className="block text-xs leading-none md:hidden">–</span>
            <span className="block whitespace-nowrap md:inline">
              {dateParts[1]}
            </span>
          </>
        ) : (
          <span className="whitespace-nowrap">{date}</span>
        )}
      </span>
    </>
  );
};

// Accordion section components
export const AccordionSection = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => <ResumeCard className={className}>{children}</ResumeCard>;

export const AccordionSectionHeader = ({
  children,
  icon,
}: {
  children: ReactNode;
  icon?: ReactNode;
}) => <SectionHeading icon={icon}>{children}</SectionHeading>;

export const AccordionSectionContent = ({
  children,
  autoOpenValue,
}: {
  children: ReactNode;
  autoOpenValue?: string;
}) => {
  const [value, setValue] = useState<string[]>([]);

  useEffect(() => {
    if (!autoOpenValue) return;
    const timer = setTimeout(() => setValue([autoOpenValue]), 100);
    return () => clearTimeout(timer);
  }, [autoOpenValue]);

  return (
    <Accordion type="multiple" value={value} onValueChange={setValue}>
      {children}
    </Accordion>
  );
};

// Skills section
export const SkillsSection = () => (
  <ResumeCard>
    <SectionHeading
      icon={<Wrench className="w-5 h-5 md:w-6 md:h-6 text-accent" />}
    >
      Skills
    </SectionHeading>
    <div className="flex flex-wrap gap-2">
      {aboutData.skills.map((skill) => (
        <SkillChip key={skill}>{skill}</SkillChip>
      ))}
    </div>
  </ResumeCard>
);
