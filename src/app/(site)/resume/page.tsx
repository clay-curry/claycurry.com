"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/src/lib/ui/components/accordion";
import UnderConstruction from "@/src/lib/ui/components/under-construction";
import { PageViews } from "@/src/lib/ui/widgets/page-views";
import type { ReactNode } from "react";
import Link from "next/link";

export default () => (
  <>
    <style jsx>{`
      @keyframes fadeInEffect {
        to {
          opacity: 1;
        }
      }
    `}</style>

    <section className="w-full flex flex-col items-center px-4">
      <div className="w-full max-w-6xl flex justify-end mt-4">
        <PageViews />
      </div>

      {/* Header */}
      <div className="w-full max-w-6xl text-center py-12">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
          Clay Curry
        </h1>
        <p className="mt-4 text-xl md:text-2xl text-gray-700 dark:text-gray-300">
          Software Development Engineer
        </p>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Seattle, WA •{" "}
          <a href="mailto:me@claycurry.com" className="text-blue-600 dark:text-blue-400 hover:underline">
            me@claycurry.com
          </a>{" "}
          •{" "}
          <a href="https://github.com/clay-curry" className="text-blue-600 dark:text-blue-400 hover:underline">
            GitHub
          </a>{" "}
          •{" "}
          <a href="https://linkedin.com/in/clay-curry" className="text-blue-600 dark:text-blue-400 hover:underline">
            LinkedIn
          </a>
        </p>
      </div>
       
      {/* About Me */}
      <AboutMeSection>
        <AboutMeHeader>
          About Me
        </AboutMeHeader>
        <AboutMeContent>
          I enjoy building <i>useful</i> software features (and removing unuseful ones) within large legacy systems. My 
          passion lies in learning how systems create value for users and expanding their impact, preferrably at scale.
        </AboutMeContent>
      </AboutMeSection>

      {/* Open Source Contributions */}
      <Card delay=".3s">
        <SectionHeading>Open Source Contributions</SectionHeading>
        <UnderConstruction />
      </Card>

      {/* Professional Experience */}
      <AccordionSection delay=".4s">
        <AccordionSectionHeader>Professional Experience</AccordionSectionHeader>
        <AccordionSectionContent defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger className="font-semibold text-gray-900 dark:text-gray-100">
              <AccordionHeader title="Amazon.com — Software Development Engineer" date="Nov 2024 – Current" />
            </AccordionTrigger>
            <AccordionContent>
              <OrgLocationRow
                org="Core Shopping"
                location="Seattle, WA"
                links={[
                  { label: "Detail Page", href: "https://www.amazon.com/dp/0471417432" },
                  { label: "Buybox", href: "https://www.helium10.com/blog/what-is-the-amazon-buy-box/#what-is-the-buy-box-on-amazon" },
                ]}
              />
              <BulletList items={[
                "Owned a Buybox ranking upgrade for used book offers, producing affordability savings for customers resulting in 9.7MM lift in annualized units sold and $30.2 MM lift in annualized OPS",
                "Expanded the Buybox \"Join Prime\" accordion button to 24 countries, producing 5 additional service and business metrics.",
                "Participated in a 24x7 engineering on-call rotation for Buybox to ensure service uptime and subject matter expert availability.",
              ]} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger className="font-semibold text-gray-900 dark:text-gray-100">
              <AccordionHeader title="University of Oklahoma — Linux System Administrator" date="Feb 2021 – Jan 2023" />
            </AccordionTrigger>
            <AccordionContent>
              <OrgLocationRow org="Department of Physics" location="Norman, OK" />
              <BulletList items={[
                "Administered 72 research Red Hat Enterprise Linux workstations for numerical computing workloads.",
                "Saved 4 weeks of annual IT operational effort by streamlining inventory-taking procedures using background jobs.",
                "Ported legacy department website content to modern content management software, leveraging Python to automate the transfer of 120 pages of structured data.",
              ]} />
            </AccordionContent>
          </AccordionItem>
        </AccordionSectionContent>
      </AccordionSection>

      {/* Select Courses & Frameworks */}
      <Card delay=".6s">
        <SectionHeading>Selected Topics</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <GridCard
            title="Refactoring - Premium"
            subtitle="Refactoring Guru"
            href="https://refactoring.guru/refactoring"
          />
          <GridCard
            title="Webpack Fundamentals"
            subtitle="Frontend Masters"
            href="https://frontendmasters.com/courses/webpack-fundamentals/"
          />
          <GridCard
            title="Search Engine Optimization"
            subtitle="Next.js"
            href="https://nextjs.org/learn/seo"
          />
          <GridCard
            title="Utility-First CSS Framework"
            subtitle="TailwindCSS"
            href="https://tailwindcss.com/"
          />
          <GridCard
            title="Component Library"
            subtitle="Shadcn/UI"
            href="https://ui.shadcn.com/"
          />
        </div>
      </Card>

      {/* Certifications */}
      <AccordionSection delay=".8s">
        <AccordionSectionHeader>Certifications</AccordionSectionHeader>
        <AccordionSectionContent>
          <AccordionItem value="cert-1">
            <AccordionTrigger className="font-semibold text-gray-900 dark:text-gray-100">
              <AccordionHeader title="AWS Solutions Architect – Professional" date="Nov 2025" />
            </AccordionTrigger>
            <AccordionContent>
              <div className="text-gray-700 dark:text-gray-300">
                <PrimaryLink href="https://www.credly.com/badges/c4d07372-5471-409a-a842-950f6b94dab4/public_url">
                  Proof of Certification
                </PrimaryLink>
              </div>
            </AccordionContent>
          </AccordionItem>
        </AccordionSectionContent>
      </AccordionSection>

      {/* Education */}
      <AccordionSection delay=".6s">
        <AccordionSectionHeader>Education</AccordionSectionHeader>
        <AccordionSectionContent>
          <AccordionItem value="edu-1">
            <AccordionTrigger className="font-semibold text-gray-900 dark:text-gray-100">
              <AccordionHeader title="Computer Science, B.S." date="Dec 2023" />
            </AccordionTrigger>
            <AccordionContent>
              <div className="text-gray-700 dark:text-gray-300">
                <p>University of Oklahoma. Mathematics minor.</p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </AccordionSectionContent>
      </AccordionSection>

      {/* Awards and Honors */}
      <AccordionSection delay="1.0s">
        <AccordionSectionHeader>Awards and Honors</AccordionSectionHeader>
        <AccordionSectionContent>
          <AccordionItem value="award-1">
            <AccordionTrigger className="font-semibold text-gray-900 dark:text-gray-100">
              <AccordionHeader title="Association for Computing Machinery (ACM), Oklahoma Student Chapter" date="Sep 2021 – Sep 2022" />
            </AccordionTrigger>
            <AccordionContent>
              <PositionAdvisorRow
                position="President, Chair"
                advisor={{ name: "Rafal Jabrzemski", href: "https://www.linkedin.com/in/rafal-jabrzemski-0546464/" }}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="award-2">
            <AccordionTrigger className="font-semibold text-gray-900 dark:text-gray-100">
              <AccordionHeader title="Association for Women in Computing (Student Chapter)" date="Apr 2021 – Sep 2022" />
            </AccordionTrigger>
            <AccordionContent>
              <PositionAdvisorRow
                position="Treasurer"
                advisor={{ name: "Sridhar Radhakrishnan", href: "https://www.linkedin.com/in/sridhar-radhakrishnan-b3591817/" }}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="award-3">
            <AccordionTrigger className="font-semibold text-gray-900 dark:text-gray-100">
              <AccordionHeader title="Oklahoma Rising Scholars Award (formerly Academic Scholars Program)" date="May 2017" />
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex justify-between text-gray-900 dark:text-gray-100">
                <div>
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-bold">Issued by:</span> Oklahoma State Regents for Higher Education
                  </p>
                  <p className="mt-2 text-gray-700 dark:text-gray-300">
                    Oklahoma students can automatically qualify for the program by scoring at or above the 99.5 percentile on the ACT or SAT
                  </p>
                </div>
                <span className="text-gray-700 dark:text-gray-300">
                  <PrimaryLink href="/highschool-transcript.jpeg">Proof</PrimaryLink>
                </span>
              </div>
            </AccordionContent>
          </AccordionItem>
        </AccordionSectionContent>
      </AccordionSection>

      {/* Test Scores */}
      <AccordionSection delay="1.2s" className="mb-16">
        <AccordionSectionHeader>Test Scores</AccordionSectionHeader>
        <AccordionSectionContent>
          <AccordionItem value="test-1">
            <AccordionTrigger className="font-semibold text-gray-900 dark:text-gray-100">
              <AccordionHeader title="ACT exam: 34 / 36" date="Sep 2016" />
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex justify-between text-gray-900 dark:text-gray-100">
                <div>
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-bold">College Readiness Exam:</span> University of Oklahoma
                  </p>
                </div>
                <span className="text-gray-700 dark:text-gray-300">
                  <PrimaryLink href="/highschool-transcript.jpeg">Proof</PrimaryLink>
                </span>
              </div>
            </AccordionContent>
          </AccordionItem>
        </AccordionSectionContent>
      </AccordionSection>
    </section>
  </>
);


// Reusable link component for external/internal links
const PrimaryLink = ({ href, children }: { href: string; children: ReactNode }) => (
  <Link
    href={href}
    className="text-blue-600 dark:text-blue-400 underline underline-offset-4 decoration-blue-400 dark:decoration-blue-600"
  >
    {children}
  </Link>
);


// Card with fade-in animation
const Card = ({
  children,
  delay,
  className = ""
}: {
  children: ReactNode;
  delay: string;
  className?: string;
}) => (
  <div
    className={`w-full max-w-6xl mt-8 p-6 rounded-xl bg-white dark:bg-zinc-900 shadow-md border border-gray-100 dark:border-zinc-800 opacity-0 transition-opacity duration-700 ${className}`}
    style={{
      animation: "fadeInEffect 0.5s forwards",
      animationDelay: delay,
    }}
  >
    {children}
  </div>
);

// Section heading with underline decoration
const SectionHeading = ({ children }: { children: ReactNode }) => (
  <h2 className="text-2xl font-semibold underline underline-offset-4 decoration-blue-400 dark:decoration-blue-600 mb-4">
    {children}
  </h2>
);

// Accordion trigger header with title and date
const AccordionHeader = ({ title, date }: { title: string; date: string }) => (
  <div className="flex flex-1 justify-between items-start">
    <span>{title}</span>
    <span className="font-normal text-gray-600 dark:text-gray-400">{date}</span>
  </div>
);

// Organization/location row in accordion content
const OrgLocationRow = ({
  org,
  location,
  links
}: {
  org: string;
  location: string;
  links?: { label: string; href: string }[];
}) => (
  <div className="flex justify-between text-gray-900 dark:text-gray-100">
    <span>
      <span className="font-bold">Organization:</span> {org}
      {links && links.length > 0 && (
        <> ({links.map((link, i) => (
          <span key={link.href}>
            {i > 0 && ", "}
            <PrimaryLink href={link.href}>{link.label}</PrimaryLink>
          </span>
        ))})</>
      )}
    </span>
    <span>{location}</span>
  </div>
);

// Bullet list for experience items
const BulletList = ({ items }: { items: string[] }) => (
  <ul className="mt-2 space-y-2 list-disc ml-6 text-gray-700 dark:text-gray-300">
    {items.map((item) => <li key={item.slice(0, 50)}>{item}</li>)}
  </ul>
);

// Position/advisor row for awards
const PositionAdvisorRow = ({
  position,
  advisor
}: {
  position: string;
  advisor?: { name: string; href: string };
}) => (
  <div className="flex justify-between text-gray-900 dark:text-gray-100">
    <span className="text-gray-700 dark:text-gray-300">
      <span className="font-bold">Position:</span> {position}
    </span>
    {advisor && (
      <span className="text-gray-700 dark:text-gray-300">
        <span className="font-bold">Advisor:</span>{" "}
        <PrimaryLink href={advisor.href}>{advisor.name}</PrimaryLink>
      </span>
    )}
  </div>
);

// About Me section components
const AboutMeSection = ({ children }: { children: ReactNode }) => (
  <Card delay=".2s" className="mt-12">
    {children}
  </Card>
);

const AboutMeHeader = ({ children }: { children: ReactNode }) => (
  <SectionHeading>{children}</SectionHeading>
);

const AboutMeContent = ({ children }: { children: ReactNode }) => (
  <div className="space-y-3 text-gray-700 dark:text-gray-300">
    <p>{children}</p>
  </div>
);

// Accordion section components (shared by Professional Experience, Education, Certifications, Awards, Test Scores)
const AccordionSection = ({
  children,
  delay,
  className = ""
}: {
  children: ReactNode;
  delay: string;
  className?: string;
}) => (
  <Card delay={delay} className={className}>
    {children}
  </Card>
);

const AccordionSectionHeader = ({ children }: { children: ReactNode }) => (
  <SectionHeading>{children}</SectionHeading>
);

const AccordionSectionContent = ({ children, defaultValue }: { children: ReactNode; defaultValue?: string }) => (
  <Accordion type="single" collapsible defaultValue={defaultValue}>
    {children}
  </Accordion>
);

// Grid card for courses/frameworks
const GridCard = ({
  title,
  subtitle,
  href
}: {
  title: string;
  subtitle: string;
  href: string;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="block p-4 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200"
  >
    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
  </a>
);
