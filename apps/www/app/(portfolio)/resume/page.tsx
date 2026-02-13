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

export default function ResumePage() {
  return (
    <article className="py-8 md:py-12 md:px-4">
      <section className="flex flex-col items-center w-full">
        {/* Header */}
        <HeaderSection
          name="Clay Curry"
          title="Product | Design Engineer"
          socialLinks={[
            {
              icon: MapPin,
              href: "https://www.google.com/maps/place/San+Francisco,+CA",
              label: "Location",
              clickId: "resume:location",
            },
            {
              icon: Mail,
              href: `mailto:${profileData.email}`,
              label: "Email",
              clickId: "resume:email",
            },
            {
              icon: XIcon,
              href: profileData.social.x,
              label: "X",
              clickId: "resume:x",
            },
            {
              icon: GithubIcon,
              href: profileData.social.github,
              label: "GitHub",
              clickId: "resume:github",
            },
            {
              icon: LinkedinIcon,
              href: profileData.social.linkedin,
              label: "LinkedIn",
              clickId: "resume:linkedin",
            },
          ]}
        />

        {/* Objective */}
        <AccordionSection>
          <AccordionSectionHeader icon={Briefcase}>
            Objective
          </AccordionSectionHeader>
          <AccordionSectionContent>
            <AccordionItem value="item-0">
              <AccordionTrigger className="py-4 p-1 leading-6 text-sm">
                <div>
                  <p className="text-sm flex-1 pb-4">TL;DR: -</p>
                  <ol className="list-disc pl-4">
                    <li>Amazon (1 year) + University of Oklahoma (3 years).</li>
                    <li>
                      Computer scientist / Product Engineer / I get shit done.
                    </li>
                    <li>
                      Have important things to automate but would rather to vibe
                      on something else? - Hire me!
                    </li>
                  </ol>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <p className="pt-32 py-4 p-1 leading-6">
                  Hi. I have 14 months of experience contributing software to
                  distributed machine learning systems on Amazon homepage and
                  product overview. Over this period, I contributed to every
                  stage in the product release lifecycle at scale — from design
                  and implementation to deployment and operational support.
                </p>
                <p className="py-4 p-1 leading-6">
                  I'm now looking for a role at a growth-stage company where
                  each release cycle is anchored to the customer — driven by
                  user metrics and feedback loops that boost engagement, improve
                  adoption, and compound business outcomes over time.
                </p>
                <p className="py-4 p-1 leading-6">
                  Long-term, my goal is to own this lifecycle end-to-end by
                  integrating engineering, design, and business strategy.
                </p>

                <h4 className="font-semibold mt-6">Reasons to hire me:</h4>
                <ol className="list-disc px-8 grid grid-cols-1 gap-4 pt-4">
                  <li>
                    <span className="font-bold">Not a dick.</span> brutally
                    honest, without the Steve Jobs complex.
                  </li>
                  <li>
                    <span className="font-bold">High Agency.</span> anything in
                    my life that is mundane, repetitive, and not automated, will
                    be.
                  </li>
                  <li>
                    <span className="font-bold"> AI/ML infra.</span> i
                    decommissioned the offer ranking service deciding the price
                    for used books across Amazon.
                  </li>
                  <li>
                    <span className="font-bold">Breadth. </span>I move
                    comfortably from TypeScript frontend to Python backends to
                    Kubernetes deployments to AWS infrastructure.
                  </li>
                </ol>

                <h4 className="font-semibold mt-6">Reasons not to hire me:</h4>
                <ol className="list-disc px-8 grid grid-cols-1 gap-4 pt-4">
                  <li>
                    <span className="font-bold">Location. Nomad.</span> HB (my
                    cat) and I are relocating to San Francisco on 02/15/2026.
                    She tells me its this magical dystopia where nobody can
                    afford a house (?), yet anyone can afford enough lululemon
                    to open their own store.
                  </li>
                  <li>
                    <span className="font-bold">
                      My Self-Doubt Demon. (OCD?)
                    </span>
                    often whenever i catch my own mistake, I let down my guard
                    long enough for a Demon to ambush my consciousness. the
                    demon takes the exact form of an imaginary Power law
                    relationship between the "Quality" of my work and the
                    "Efficiency" required to complete it. this creates
                    self-doubt inside me, which manifests externally as possible
                    performance.
                  </li>
                </ol>
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
                      "Designed, implemented, and production-ized a BuyBox ranking major upgrade that produced $30.2 MM revenue growth and 9.7MM lift in annualized units sold.",
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

// Header section with TRON glow effect
const HeaderSection = ({
  name,
  title,
  quote,
  socialLinks,
}: {
  name: string;
  title: string;
  quote?: string;
  socialLinks: {
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    label: string;
    clickId?: string;
  }[];
}) => (
  <div className="flex flex-col gap-2 w-full py-16 tracking-tight text-center">
    <h1 className="text-3xl font-bold md:text-4xl lg:text-5xl text-foreground text-shadow-none">
      {name}
    </h1>
    <p className="mt-4 text-muted-foreground text-md md:text-lg">{title}</p>
    <div className="mt-4 flex items-center justify-center gap-[1.125rem]">
      {socialLinks.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          data-click-id={link.clickId}
          className="inline-flex items-center justify-center size-9 rounded-xl border border-border text-foreground bg-muted hover:bg-muted/80 transition-colors"
          aria-label={link.label}
        >
          <link.icon className="size-4" />
        </a>
      ))}
    </div>
    {quote && (
      <p className="mt-6 text-lg font-bold italic text-muted-foreground">
        &ldquo;{quote}&rdquo;
      </p>
    )}
  </div>
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
