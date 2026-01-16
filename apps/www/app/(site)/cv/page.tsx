"use client";
import { cva } from "class-variance-authority";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/lib/ui/components/accordion";
import {
  CVBulletList,
  CVContentBody,
  CVDetailBlock,
  CVHighlight,
  CVLink,
  CVOrgLocation,
  CVPositionAdvisor,
  CVSimpleContent,
} from "@/lib/ui/components/cv";
import ComingSoon from "@/lib/ui/components/under-construction";
import StylizedArrow from "@/lib/ui/icons/stylized-arrow";
import { PageViews } from "@/lib/ui/widgets/page-views";

export default () => (
  <article>
    <style jsx>{`
      @keyframes fadeInEffect {
        to {
          opacity: 1;
        }
      }
    `}</style>

    <section className="flex flex-col items-center w-full px-1 md:px-3">
      <PageViews />

      {/* Header */}
      <HeaderSection
        name="Clay Curry"
        title="Full-Stack Developer"
        addressList={[
          { text: "GitHub", href: "https://github.com/clay-curry" },
          { text: "LinkedIn", href: "https://www.linkedin.com/in/clay-curry/" },
          { text: "me@claycurry.com", href: "mailto:me@claycurry.com" },
        ]}
      />

      {/* About Me */}
      <AboutMeSection>
        <AboutMeHeader>About Me</AboutMeHeader>
        <AboutMeContent>
          <p>
            I'm a Software Engineer from San Francisco, California, specializing in web application development and 
            creating  innovative digital solutions. I enjoy turning complex problems into simple, beautiful and intuitive 
            solutions.
          </p>
            
          <p>
          My job is to build your website or application so that it is functional and user-friendly but at the same time 
          attractive. Moreover, I add personal touch to your product and make sure that is eye-catching and easy to use. 
          My aim is to bring across your message and identity in the most creative way. I've worked with various 
          technologies including React, Next.js, Node.js, and modern cloud platforms.
          </p>
        </AboutMeContent>
      </AboutMeSection>

      {/* Professional Experience */}
      <AccordionSection delay=".3s">
        <AccordionSectionHeader>Experience</AccordionSectionHeader>
        <AccordionSectionContent>
          <AccordionItem value="item-1">
            <AccordionTrigger className="font-semibold text-gray-900 dark:text-gray-100">
              <AccordionHeader
                title="Amazon.com. Software Dev Engineer."
                date="1 year, 2 months"
              />
            </AccordionTrigger>
            <AccordionContent>
              <CVContentBody>
                <CVOrgLocation
                  org={
                    <>
                      <div className="flex flex-col md:flex-row">
                      <div>
                        Core Shopping{" "}
                        <StylizedArrow className="inline-block w-6 h-6 align-middle" />{" "}
                        <CVLink href="https://www.amazon.com/dp/https://www.amazon.com/dp/0000000000">{" "}
                        Product Detail Page{" "}
                        </CVLink>{" "}
                        <StylizedArrow className="inline-block w-6 h-6 align-middle" />{" "}
                      </div>
                      <div>
                      <CVLink href="https://www.helium10.com/blog/what-is-the-amazon-buy-box/">
                        BuyBox
                      </CVLink>{" "}
                      </div>
                      </div>
                      
                    </>
                  }
                  location="Seattle, WA"
                />
                <CVBulletList
                  items={[
                    "Drove the launch of a BuyBox ranking updgrade that produced $30.2 MM revenue growth and 9.7MM lift in annualized units sold.",
                    'Expanded the "Join Prime" BuyBox button to 24 countries, producing 5 additional service and business metrics.',
                    "Participated in a 24x7 engineering on-call rotation for BuyBox to ensure service uptime and subject matter expert availability.",
                  ]}
                />
              </CVContentBody>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger className="font-semibold text-gray-900 dark:text-gray-100">
              <AccordionHeader
                title="University of Oklahoma. Linux System Administrator."
                date="2 years, 10 months"
              />
            </AccordionTrigger>
            <AccordionContent>
              <CVContentBody>
                <CVOrgLocation org="Department of Physics" location="Norman, OK" />
                <CVBulletList
                  items={[
                    "Securely administered 150+ Linux lab workstations and servers used by 2,000+ students and faculty members.",
                    "Reduced system downtime by 18% by implementing automated monitoring and alerting for critical services.",
                    "Saved 4 weeks of annual IT operational effort by streamlining inventory-taking procedures using background jobs.",
                    "Ported legacy department website content to modern content management software, leveraging Python to automate the transfer of 120 pages of structured data.",
                  ]}
                />
              </CVContentBody>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger className="font-semibold text-gray-900 dark:text-gray-100">
              <AccordionHeader
                title="University of Oklahoma. Computer Vision Research Assistant."
                date="1 year, 2 months"
              />
            </AccordionTrigger>
            <AccordionContent>
              <OrgLocationRow location="Norman, OK">
                Department of Computer Science
              </OrgLocationRow>
              <BulletList
                items={[
                  "Provisioned 12 workstations for GPU-accelerated deep learning research, improving model training times by 80%.",
                  "Scraped and preprocessed 90GB+ of FAA aircraft transponder data collected by crowdsourced receivers.",
                  "Trained and evaluated multiple machine learning models (Random Forest, CNN, LSTM) to classify aircraft trajectories with 92% accuracy.",
                ]}
              />
            </AccordionContent>
          </AccordionItem>
        </AccordionSectionContent>
      </AccordionSection>

      {/* Contributions */}
      <Card delay=".4s">
        <ComingSoon>
          <SectionHeading>Contributions</SectionHeading>
          <div className="h-48"/>
        </ComingSoon>
      </Card>

      {/* Education */}
      <AccordionSection delay=".8">
        <AccordionSectionHeader>Education</AccordionSectionHeader>
        <AccordionSectionContent>
          <AccordionItem value="edu-1">
            <AccordionTrigger className="font-semibold text-gray-900 dark:text-gray-100">
              <AccordionHeader
                title="University of Oklahoma. Computer Science, B.S."
                date="Dec 2023"
              />
            </AccordionTrigger>
            <AccordionContent>
              <div className="text-gray-700 dark:text-gray-300">
                <p>Mathematics minor.</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="edu-2">
            <AccordionTrigger className="font-semibold text-gray-900 dark:text-gray-100">
              <AccordionHeader
                title="Choctaw High School. Diploma."
                date="May 2017"
              />
            </AccordionTrigger>
            <AccordionContent>
              <div className="text-gray-700 dark:text-gray-300">
                <p className="mb-2">
                  <span className="font-bold text-gray-900 dark:text-gray-100">
                    Valedictorian
                  </span>{" "}
                  •{" "}
                  <span className="font-bold text-gray-900 dark:text-gray-100">
                    ACT Scholar
                  </span>
                </p>
                <p className="mb-2">
                  <span className="font-bold">ACT Score:</span> 34 / 36
                </p>
                <p>
                  <PrimaryLink href="/assets/cv/highschool-transcript.jpeg">
                    transcript
                  </PrimaryLink>
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="edu-3">
            <AccordionTrigger className="font-semibold text-gray-900 dark:text-gray-100">
              <AccordionHeader
                title="Certification: AWS Solutions Architect – Professional"
                date="Nov 2025"
              />
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

      {/* Awards and Honors */}
      <AccordionSection delay="1.0s">
        <AccordionSectionHeader>Awards and Honors</AccordionSectionHeader>
        <AccordionSectionContent>
          <AccordionItem value="award-1">
            <AccordionTrigger className="font-semibold text-gray-900 dark:text-gray-100">
              <AccordionHeader
                title="Association for Computing Machinery (ACM), Oklahoma Student Chapter"
                date="1 year"
              />
            </AccordionTrigger>
            <AccordionContent>
              <PositionAdvisorRow
                position="President, Chair"
                advisor={{
                  name: "Rafal Jabrzemski",
                  href: "https://www.linkedin.com/in/rafal-jabrzemski-0546464/",
                }}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="award-2">
            <AccordionTrigger className="font-semibold text-gray-900 dark:text-gray-100">
              <AccordionHeader
                title="Association for Women in Computing (Student Chapter)"
                date="1 year, 5 months"
              />
            </AccordionTrigger>
            <AccordionContent>
              <PositionAdvisorRow
                position="Treasurer"
                advisor={{
                  name: "Sridhar Radhakrishnan",
                  href: "https://www.linkedin.com/in/sridhar-radhakrishnan-b3591817/",
                }}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="award-3">
            <AccordionTrigger className="font-semibold text-gray-900 dark:text-gray-100">
              <AccordionHeader
                title="Oklahoma Rising Scholars Award (formerly Academic Scholars Program)"
                date="May 2017"
              />
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex justify-between text-gray-900 dark:text-gray-100">
                <div>
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-bold">Issued by:</span> Oklahoma State
                    Regents for Higher Education
                  </p>
                  <p className="mt-2 text-gray-700 dark:text-gray-300">
                    Oklahoma students can automatically qualify for the program
                    by scoring at or above the 99.5 percentile on the ACT or SAT
                  </p>
                </div>
                <span className="text-gray-700 dark:text-gray-300">
                  <PrimaryLink href="/assets/cv/highschool-transcript.jpeg">
                    Proof
                  </PrimaryLink>
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
                    <span className="font-bold">College Readiness Exam:</span>{" "}
                    University of Oklahoma
                  </p>
                </div>
                <span className="text-gray-700 dark:text-gray-300">
                  <PrimaryLink href="/assets/cv/highschool-transcript.jpeg">
                    Proof
                  </PrimaryLink>
                </span>
              </div>
            </AccordionContent>
          </AccordionItem>
        </AccordionSectionContent>
      </AccordionSection>
    </section>
  </article>
);

// Reusable link component for external/internal links
const PrimaryLink = ({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) => (
  <Link
    href={href}
    className="text-blue-600 underline dark:text-blue-400 underline-offset-4 decoration-blue-400 dark:decoration-blue-600"
  >
    {children}
  </Link>
);

// Card with fade-in animation
const Card = ({
  children,
  delay,
  className = "",
}: {
  children: ReactNode;
  delay: string;
  className?: string;
}) => (
  <div
    className={cva(
      "w-full max-w-6xl mt-6 md:mt-8 p-3 md:p-4 rounded-xl bg-white dark:bg-zinc-900 shadow-md border border-gray-100 dark:border-zinc-800 opacity-0 transition-opacity duration-700",
    )({ className })}
    style={{
      animation: "fadeInEffect 0.5s forwards",
      animationDelay: delay,
    }}
  >
    {children}
  </div>
);

// Header section with name, title, and address
const HeaderSection = ({
  name,
  title,
  addressList,
}: {
  name: string;
  title: string;
  addressList: { text: string; href?: string }[];
}) => (
  <div className="w-full max-w-6xl py-12 tracking-tight text-center">
    <h1 className="text-3xl font-bold md:text-4xl lg:text-5xl">
      {name}
    </h1>
    <p className="mt-4 text-xl text-gray-700 md:text-2xl dark:text-gray-300">
      {title}
    </p>
    <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
      <AddressList items={addressList} />
    </p>
  </div>
);

const AddressList = ({
  items,
}: {
  items: { text: string; href?: string }[];
}) => {
  return items
    .map((element) =>
      element.href ? (
        <a
          href={element.href}
          key={element.href}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          {element.text}
        </a>
      ) : (
        element.text
      ),
    )
    .flatMap((element, index, array) => {
      const separators = [" ", "•", " "];
      return index < array.length - 1 ? [element, ...separators] : [element];
    });
};

// Section heading with underline decoration
const SectionHeading = ({ children }: { children: ReactNode }) => (
  <h2 className="mb-2 text-xl font-semibold underline md:text-2xl underline-offset-4 decoration-blue-400 dark:decoration-blue-600 md:mb-4">
    {children}
  </h2>
);

// Accordion trigger header with title and date
const AccordionHeader = ({ title, date }: { title: string; date: string }) => {
  // Split date range like "Nov 2024 – Current" into parts
  const dateParts = date.split(/\s*[–-]\s*/);

  return (
    <>
      <span className="flex-1 text-left">{title}</span>
      <span className="font-normal leading-tight text-center text-gray-600 dark:text-gray-400 shrink-0 md:text-right md:leading-normal">
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

const AccordionContentBody = ({ children }: { children: ReactNode }) => (
  <AccordionContentWrapper>
    <AccordionContentTopBorder />
    <AccordionContentSideBorders>{children}</AccordionContentSideBorders>
  </AccordionContentWrapper>
);

const AccordionContentWrapper = ({ children }: { children: ReactNode }) => (
  <div className="mt-2 text-gray-700 dark:text-gray-300">{children}</div>
);

const AccordionContentTopBorder = () => (
  <div className="w-8 mx-auto mb-2 border-t border-gray-300 dark:border-gray-600" />
);

const AccordionContentSideBorders = ({ children }: { children: ReactNode }) => (
  <div className="border-l border-r border-gray-300 dark:border-gray-600 my-0.5 px-2 py-3">
    {children}
  </div>
);

// Organization/location row in accordion content
const OrgLocationRow = ({
  location,
  children,
}: {
  location: string;
  children?: ReactNode;
}) => (
  <div className="flex flex-col text-gray-900 sm:flex-row sm:justify-between dark:text-gray-100">
    <span>
      <span className="font-bold">org:</span> {children}
    </span>
    <span>
      <span className="font-bold">location:</span> {location}
    </span>
  </div>
);

// Bullet list for experience items
const BulletList = ({ items }: { items: string[] }) => (
  <ul className="mt-2 ml-6 space-y-2 text-gray-700 list-disc dark:text-gray-300">
    {items.map((item) => (
      <li key={item.slice(0, 50)}>{item}</li>
    ))}
  </ul>
);

// Position/advisor row for awards
const PositionAdvisorRow = ({
  position,
  advisor,
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
    {children}
  </div>
);

// Accordion section components (shared by Professional Experience, Education, Certifications, Awards, Test Scores)
const AccordionSection = ({
  children,
  delay,
  className = "",
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

const AccordionSectionContent = ({
  children,
  defaultValue,
}: {
  children: ReactNode;
  defaultValue?: string;
}) => (
  <Accordion type="single" collapsible defaultValue={defaultValue}>
    {children}
  </Accordion>
);
