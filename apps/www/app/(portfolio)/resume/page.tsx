"use client";

import { cva } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import {
  Award,
  BookOpen,
  Briefcase,
  GithubIcon,
  LinkedinIcon,
  Mail,
  MapPin,
  User,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { XIcon } from "@/lib/components/icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/lib/components/ui/accordion";
import {
  CVBulletList,
  CVContentBody,
  CVLink,
  CVOrgLocation,
  CVRowItem,
} from "@/lib/components/ui/cv";
import { aboutData, profileData } from "@/lib/portfolio-data";
import { cn } from "@/lib/utils";

export default function ResumePage() {
  return (
    <article className="py-8 md:py-12 px-2 md:px-4">
      <section className="flex flex-col items-center w-full">
        {/* Header */}
        <HeaderSection>
          <HeaderName>Clay Curry</HeaderName>
          <HeaderTitle>"Make Shit Fucking Happen" Product Engineer</HeaderTitle>
          <HeaderSocialLinks>
            <HeaderSocialLink
              icon={MapPin}
              href="https://www.google.com/maps/place/San+Francisco,+CA"
              label="Location"
              clickId="resume:location"
            />
            <HeaderSocialLink
              icon={Mail}
              href={`mailto:${profileData.email}`}
              label="Email"
              clickId="resume:email"
            />
            <HeaderSocialLink
              icon={XIcon}
              href={profileData.social.x}
              label="X"
              clickId="resume:x"
            />
            <HeaderSocialLink
              icon={GithubIcon}
              href={profileData.social.github}
              label="GitHub"
              clickId="resume:github"
            />
            <HeaderSocialLink
              icon={LinkedinIcon}
              href={profileData.social.linkedin}
              label="LinkedIn"
              clickId="resume:linkedin"
            />
          </HeaderSocialLinks>
        </HeaderSection>

        {/* Objective */}
        <AccordionSection>
          <AccordionSectionHeader icon={Briefcase}>
            Objective
          </AccordionSectionHeader>
          <AccordionSectionContent>
            <AccordionItem value="item-0">
              <AccordionTrigger className="py-4 p-1 leading-6 text-sm">
                <div className="flex-1">
                  <p className="text-sm pb-4">TL;DR:</p>
                  <ul className="list-disc pl-4">
                    <li>
                      Scrappy programmer energized by high-impact problems.
                    </li>
                    <li>
                      Looking for programming-related roles at startup and
                      growing organizations.
                    </li>
                    <li>Salary not required.</li>
                    <li>Hate manual bullshit? I can automate it. Hire me.</li>
                    <li>
                      Hobbies include exercising and fixing / building in
                      public.
                    </li>
                  </ul>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <CVContentBody className="mt-10">
                  <p className="py-4 p-1 leading-6">
                    I am a scrappy programmer who gets energy from high-impact
                    problems. I spent a year at Amazon shipping ML
                    infrastructure ranking offers billions of times per day. I
                    spent three years at the University of Oklahoma setting up
                    accelerated training, training computer vision models, and
                    administering Linux systems. Now I am looking for
                    programming-related roles at startups and growing
                    organizations where I can help turn messy, manual workflows
                    into reliable automated systems. Salary is nice but not
                    required — I am happy accept connections / referrals in lieu
                    of currency.
                  </p>
                  <p className="py-4 p-1 leading-6">
                    To relax, I try to exercise daily, build side projects in
                    public, and look for anything tedious enough to deserve a
                    script. If you hate manual bullshit and want someone who
                    will automate it — hire me.
                  </p>
                </CVContentBody>
              </AccordionContent>
            </AccordionItem>
          </AccordionSectionContent>
        </AccordionSection>

        {/* Professional Experience */}
        <AccordionSection>
          <AccordionSectionHeader icon={Briefcase}>
            Experience
          </AccordionSectionHeader>
          <AccordionSectionContent autoOpenValue="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger
                data-click-id="resume:accordion:experience-1"
                className="font-semibold text-muted-foreground"
              >
                <AccordionHeader
                  title="Amazon.com. Software Dev Engineer."
                  date="1 year, 2 months"
                />
              </AccordionTrigger>
              <AccordionContent>
                <CVContentBody>
                  <CVOrgLocation
                    org={
                      <div className="flex flex-col md:flex-row gap-1 text-card-foreground">
                        <span>
                          Core Shopping → Product Detail Page →{" "}
                          <CVLink href="https://www.helium10.com/blog/what-is-the-amazon-buy-box/">
                            BuyBox
                          </CVLink>
                        </span>
                      </div>
                    }
                    location="Seattle, WA"
                  />
                  <CVBulletList
                    items={[
                      "Drove the launch of an offer recommendation subsystem,  which $30.2 MM revenue growth and 9.7MM lift in annualized units sold.",
                      "Ramped-up on company-internal processes, systems, ",
                      "Leveraged feature flags and existing frameworks to administer 32 randomized controlled trials ",
                      'Expanded the "Join Prime" accordion button to 24 countries, producing 5 additional service and business metrics.',
                      "Participated in a 24x7 engineering on-call rotation to ensure service uptime and subject matter expert availability.",
                    ]}
                  />
                </CVContentBody>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger
                data-click-id="resume:accordion:experience-3"
                className="font-semibold text-muted-foreground"
              >
                <AccordionHeader
                  title="University of Oklahoma. Computer Vision Research Assistant."
                  date="1 year, 2 months"
                />
              </AccordionTrigger>
              <AccordionContent>
                <CVContentBody>
                  <CVOrgLocation
                    org="Department of Computer Science"
                    location="Norman, OK"
                  />
                  <CVBulletList
                    items={[
                      "Provisioned 12 workstations for GPU-accelerated deep learning research, improving model training times by 80%.",
                      "Scraped and preprocessed 90GB+ of FAA aircraft transponder data collected by crowdsourced receivers.",
                      "Trained and evaluated multiple machine learning models (Random Forest, CNN, LSTM) to classify aircraft trajectories with 92% accuracy.",
                    ]}
                  />
                </CVContentBody>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger
                data-click-id="resume:accordion:experience-2"
                className="font-semibold text-muted-foreground"
              >
                <AccordionHeader
                  title="University of Oklahoma. Linux System Administrator."
                  date="2 years, 10 months"
                />
              </AccordionTrigger>
              <AccordionContent>
                <CVContentBody>
                  <CVOrgLocation
                    org="Department of Physics"
                    location="Norman, OK"
                  />
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
          </AccordionSectionContent>
        </AccordionSection>

        {/* Education */}
        <AccordionSection>
          <AccordionSectionHeader icon={BookOpen}>
            Education
          </AccordionSectionHeader>
          <AccordionSectionContent>
            <AccordionItem value="edu-1">
              <AccordionTrigger
                data-click-id="resume:accordion:education-1"
                className="font-semibold text-muted-foreground"
              >
                <AccordionHeader
                  title="University of Oklahoma. Computer Science, B.S."
                  date="Dec 2023"
                />
              </AccordionTrigger>
              <AccordionContent>
                <CVContentBody>
                  <p>Mathematics minor.</p>
                  <CVBulletList
                    items={[
                      <div key="acm">
                        <div>
                          President — Association for Computing Machinery (ACM),
                          Oklahoma Student Chapter, Chair.
                        </div>
                        <div>
                          Advisor:{" "}
                          <CVLink href="https://www.linkedin.com/in/rafal-jabrzemski-0546464/">
                            Rafal Jabrzemski
                          </CVLink>
                        </div>
                      </div>,
                      <div key="awc">
                        <div>
                          Treasurer — Association for Women in Computing
                          (Student Chapter).
                        </div>
                        <div>
                          Advisor:{" "}
                          <CVLink href="https://www.linkedin.com/in/sridhar-radhakrishnan-b3591817/">
                            Sridhar Radhakrishnan
                          </CVLink>
                        </div>
                      </div>,
                    ]}
                  />
                </CVContentBody>
              </AccordionContent>
            </AccordionItem>
          </AccordionSectionContent>
        </AccordionSection>

        {/* Awards and Certifications */}
        <AccordionSection>
          <AccordionSectionHeader icon={Award}>
            Awards and Certifications
          </AccordionSectionHeader>
          <AccordionSectionContent>
            <AccordionItem value="award-1">
              <AccordionTrigger
                data-click-id="resume:accordion:award-1"
                className="font-semibold text-muted-foreground"
              >
                <AccordionHeader
                  title="Oklahoma Rising Scholars – Award"
                  date="May 2017"
                />
              </AccordionTrigger>
              <AccordionContent>
                <CVContentBody>
                  <CVRowItem label="Issued by">
                    Oklahoma State Regents for Higher Education
                  </CVRowItem>
                  <p>
                    Oklahoma students automatically qualify for this award by
                    scoring at or above the 99.5 percentile (&gt;34 / 36) on the
                    ACT college-readiness exam.
                  </p>
                  <p>
                    (formerly{" "}
                    <PrimaryLink href="https://secure.okcollegestart.org/Financial_Aid_Planning/Scholarships/Academic_Scholarships/Academic_Scholars_Program.aspx">
                      Academic Scholars Program
                    </PrimaryLink>
                    )
                  </p>
                </CVContentBody>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="cert-1">
              <AccordionTrigger
                data-click-id="resume:accordion:cert-1"
                className="font-semibold text-muted-foreground"
              >
                <AccordionHeader
                  title="AWS Solutions Architect – Professional"
                  date="Nov 2025"
                />
              </AccordionTrigger>
              <AccordionContent>
                <CVContentBody>
                  <CVRowItem label="Issued by">
                    Amazon Web Services (AWS) Training and Certification
                  </CVRowItem>
                  <p>
                    Validates advanced technical skills and experience in
                    designing distributed systems and applications on the AWS
                    platform, including complex networking, multi-account
                    strategies, cost optimization, and migration planning.
                  </p>
                  <PrimaryLink href="https://www.credly.com/badges/c4d07372-5471-409a-a842-950f6b94dab4/public_url">
                    Verify on Credly
                  </PrimaryLink>
                </CVContentBody>
              </AccordionContent>
            </AccordionItem>
          </AccordionSectionContent>
        </AccordionSection>

        {/* Skills */}
        <Card className="mb-8">
          <SectionHeading icon={Wrench}>Skills</SectionHeading>
          <div className="flex flex-wrap gap-2">
            {aboutData.skills.map((skill) => (
              <SkillChip key={skill}>{skill}</SkillChip>
            ))}
          </div>
        </Card>
      </section>
    </article>
  );
}

// TRON-styled link component
const PrimaryLink = ({
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
const Card = ({
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
const SkillChip = ({ children }: { children: ReactNode }) => (
  <span className="px-3 py-1.5 text-sm font-mono bg-secondary rounded-lg border border-border">
    {children}
  </span>
);

// Header compound components
const HeaderSection = ({
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

const HeaderName = ({
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

const HeaderTitle = ({
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

const HeaderSocialLinks = ({
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

const HeaderSocialLink = ({
  icon: Icon,
  href,
  label,
  clickId,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
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
    <Icon className="size-4" />
  </a>
);

// Section heading with TRON accent
const SectionHeading = ({
  children,
  icon: Icon,
}: {
  children: ReactNode;
  icon?: LucideIcon;
}) => (
  <div className="flex items-center gap-2 md:gap-3 my-3 border-b border-primary/30 pb-2">
    {Icon && <Icon className="w-5 h-5 md:w-6 md:h-6 text-accent" />}
    <h2 className="text-xl font-semibold md:text-2xl text-foreground text-shadow-none">
      {children}
    </h2>
  </div>
);

// Accordion trigger header with title and date
const AccordionHeader = ({ title, date }: { title: string; date: string }) => {
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

// About Me section component
const _AboutMeSection = ({ paragraphs }: { paragraphs: string[] }) => (
  <Card className="mt-4">
    <SectionHeading icon={User}>About Me</SectionHeading>
    <div className="space-y-3 my-8">
      {paragraphs.map((text) => (
        <p
          key={text}
          className="text-sm md:text-base text-card-foreground leading-relaxed"
        >
          {text}
        </p>
      ))}
    </div>
  </Card>
);

// Accordion section components
const AccordionSection = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => <Card className={className}>{children}</Card>;

const AccordionSectionHeader = ({
  children,
  icon,
}: {
  children: ReactNode;
  icon?: LucideIcon;
}) => <SectionHeading icon={icon}>{children}</SectionHeading>;

const AccordionSectionContent = ({
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
