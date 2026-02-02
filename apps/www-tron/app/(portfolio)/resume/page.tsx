'use client'

import { cva } from 'class-variance-authority'
import { Award, BookOpen, Briefcase, ClipboardList, User, Wrench } from 'lucide-react'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/lib/custom/ui/accordion'
import {
  CVBulletList,
  CVContentBody,
  CVLink,
  CVOrgLocation,
  CVPositionAdvisor,
  CVRowItem,
} from '@/lib/custom/ui/cv'
import { resumeData } from '@/lib/portfolio-data'

export default function ResumePage() {
  return (
    <article className="py-8 md:py-12">
      <section className="flex flex-col items-center w-full">
        {/* Header */}
        <HeaderSection
          name="Clay Curry"
          title="Software Engineer"
          addressList={[
            { text: 'LinkedIn', href: 'https://www.linkedin.com/in/clay-curry/' },
            { text: 'GitHub', href: 'https://github.com/clay-curry' },
            { text: 'me@claycurry.com', href: 'mailto:me@claycurry.com' },
          ]}
        />

        {/* Professional Experience */}
        <AccordionSection>
          <AccordionSectionHeader icon={Briefcase}>Experience</AccordionSectionHeader>
          <AccordionSectionContent defaultValue="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger className="font-semibold text-muted-foreground">
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
                        <span>Core Shopping → Product Detail Page →</span>
                        <CVLink href="https://www.helium10.com/blog/what-is-the-amazon-buy-box/">
                          BuyBox
                        </CVLink>
                      </div>
                    }
                    location="Seattle, WA"
                  />
                  <CVBulletList
                    items={[
                      'Launched a BuyBox ranking upgrade that produced $30.2 MM revenue growth and 9.7MM lift in annualized units sold.',
                      'Expanded the "Join Prime" accordion button to 24 countries, producing 5 additional service and business metrics.',
                      'Participated in a 24x7 engineering on-call rotation to ensure service uptime and subject matter expert availability.',
                    ]}
                  />
                </CVContentBody>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="font-semibold text-muted-foreground">
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
                      'Securely administered 150+ Linux lab workstations and servers used by 2,000+ students and faculty members.',
                      'Reduced system downtime by 18% by implementing automated monitoring and alerting for critical services.',
                      'Saved 4 weeks of annual IT operational effort by streamlining inventory-taking procedures using background jobs.',
                      'Ported legacy department website content to modern content management software, leveraging Python to automate the transfer of 120 pages of structured data.',
                    ]}
                  />
                </CVContentBody>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="font-semibold text-muted-foreground">
                <AccordionHeader
                  title="University of Oklahoma. Computer Vision Research Assistant."
                  date="1 year, 2 months"
                />
              </AccordionTrigger>
              <AccordionContent>
                <CVContentBody>
                  <CVOrgLocation org="Department of Computer Science" location="Norman, OK" />
                  <CVBulletList
                    items={[
                      'Provisioned 12 workstations for GPU-accelerated deep learning research, improving model training times by 80%.',
                      'Scraped and preprocessed 90GB+ of FAA aircraft transponder data collected by crowdsourced receivers.',
                      'Trained and evaluated multiple machine learning models (Random Forest, CNN, LSTM) to classify aircraft trajectories with 92% accuracy.',
                    ]}
                  />
                </CVContentBody>
              </AccordionContent>
            </AccordionItem>
          </AccordionSectionContent>
        </AccordionSection>

        {/* Education */}
        <AccordionSection>
          <AccordionSectionHeader icon={BookOpen}>Education</AccordionSectionHeader>
          <AccordionSectionContent>
            <AccordionItem value="edu-1">
              <AccordionTrigger className="font-semibold text-muted-foreground">
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
                      <div>
                        <div>
                          President — Association for Computing Machinery (ACM), Oklahoma Student Chapter, Chair.
                        </div>
                        <div>
                          Advisor:{' '}
                          <CVLink href="https://www.linkedin.com/in/rafal-jabrzemski-0546464/">
                            Rafal Jabrzemski
                          </CVLink>
                        </div>                      
                      </div>,
                      <div>
                        <div>
                          Treasurer — Association for Women in Computing (Student Chapter). 
                        </div>
                        <div>
                          Advisor:{' '}
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

            <AccordionItem value="edu-2">
              <AccordionTrigger className="font-semibold text-muted-foreground">
                <AccordionHeader
                  title="Choctaw High School. Diploma."
                  date="May 2017"
                />
              </AccordionTrigger>
              <AccordionContent>
                <CVContentBody>
                  <p>Valedictorian.</p>
                </CVContentBody>
              </AccordionContent>
            </AccordionItem>

          </AccordionSectionContent>
        </AccordionSection>

        {/* Certifications and Awards */}
        <AccordionSection>
          <AccordionSectionHeader icon={Award}>Certifications and Awards</AccordionSectionHeader>
          <AccordionSectionContent>
            <AccordionItem value="cert-1">
              <AccordionTrigger className="font-semibold text-muted-foreground">
                <AccordionHeader
                  title="AWS Solutions Architect – Professional"
                  date="Nov 2025"
                />
              </AccordionTrigger>
              <AccordionContent>
                <CVContentBody>
                  <PrimaryLink href="https://www.credly.com/badges/c4d07372-5471-409a-a842-950f6b94dab4/public_url">
                    Certification.
                  </PrimaryLink>
                </CVContentBody>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="award-1">
              <AccordionTrigger className="font-semibold text-muted-foreground">
                <AccordionHeader
                  title="Oklahoma Rising Scholars Award"
                  date="May 2017"
                />
              </AccordionTrigger>
              <AccordionContent>
                <CVContentBody>
                  <CVRowItem label="Issued by">Oklahoma State Regents for Higher Education</CVRowItem>
                  <p>(formerly Academic Scholars Program)</p>
                  <p>
                    Oklahoma students automatically qualify by scoring 34 / 36 on the ACT.
                  </p>
                </CVContentBody>
              </AccordionContent>
            </AccordionItem>
          </AccordionSectionContent>
        </AccordionSection>

        {/* Skills */}
        <Card className="mb-8">
          <SectionHeading icon={Wrench}>My Skills</SectionHeading>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {resumeData.skills.map((skill, index) => (
              <div key={index}>
                <div className="flex justify-between mb-2">
                  <span className="text-xs md:text-sm font-medium text-foreground">{skill.name}</span>
                  <span className="text-xs md:text-sm text-muted-foreground">{skill.level}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </article>
  )
}

// TRON-styled link component
const PrimaryLink = ({
  href,
  children,
}: {
  href: string
  children: ReactNode
}) => (
  <Link
    href={href}
    className="text-primary underline underline-offset-4 decoration-primary/50 hover:text-primary/80 transition-colors"
  >
    {children}
  </Link>
)

// TRON Card with glow effect
const Card = ({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) => (
  <div
    className={cva(
      'w-full mt-10 md:mt-14 p-2 md:p-4 rounded-xl bg-card border border-border/45'
    )({ className })}
  >
    {children}
  </div>
)

// Header section with TRON glow effect
const HeaderSection = ({
  name,
  title,
  addressList,
}: {
  name: string
  title: string
  addressList: { text: string; href?: string }[]
}) => (
  <div className="w-full py-8 tracking-tight text-center">
    <h1 className="text-3xl font-bold md:text-4xl lg:text-5xl text-foreground text-shadow-none">
      {name}
    </h1>
    <p className="mt-4 text-xl text-muted-foreground md:text-2xl">
      {title}
    </p>
    <p className="mt-2 text-lg text-muted-foreground">
      <AddressList items={addressList} />
    </p>
  </div>
)

const AddressList = ({
  items,
}: {
  items: { text: string; href?: string }[]
}) => {
  return items
    .map((element) =>
      element.href ? (
        <a
          href={element.href}
          key={element.href}
          className="text-accent-2 hover:text-accent-2/80 transition-colors"
        >
          {element.text}
        </a>
      ) : (
        element.text
      )
    )
    .flatMap((element, index, array) => {
      const separators = [' ', <span key={`bullet-${index}`} className="text-primary">•</span>, ' ']
      return index < array.length - 1 ? [element, ...separators] : [element]
    })
}

// Section heading with TRON accent
const SectionHeading = ({ children, icon: Icon }: { children: ReactNode; icon?: LucideIcon }) => (
  <div className="flex items-center gap-2 md:gap-3 my-3 border-b border-primary/30 pb-2">
    {Icon && <Icon className="w-5 h-5 md:w-6 md:h-6 text-accent" />}
    <h2 className="text-xl font-semibold md:text-2xl text-foreground text-shadow-none">
      {children}
    </h2>
  </div>
)

// Accordion trigger header with title and date
const AccordionHeader = ({ title, date }: { title: string; date: string }) => {
  const dateParts = date.split(/\s*[–-]\s*/)

  return (
    <>
      <span className="flex-1 text-left text-card-foreground hover:text-primary">{title}</span>
      <span className="font-normal leading-tight text-center text-primary shrink-0 md:text-right md:leading-normal">
        {dateParts.length > 1 ? (
          <>
            <span className="block whitespace-nowrap md:inline">{dateParts[0]}</span>
            <span className="hidden md:inline"> – </span>
            <span className="block text-xs leading-none md:hidden">–</span>
            <span className="block whitespace-nowrap md:inline">{dateParts[1]}</span>
          </>
        ) : (
          <span className="whitespace-nowrap">{date}</span>
        )}
      </span>
    </>
  )
}

// About Me section component
const AboutMeSection = ({ paragraphs }: { paragraphs: string[] }) => (
  <Card className="mt-4">
    <SectionHeading icon={User}>About Me</SectionHeading>
    <div className="space-y-3 my-8">
      {paragraphs.map((text, index) => (
        <p key={index} className="text-sm md:text-base text-card-foreground leading-relaxed">
          {text}
        </p>
      ))}
    </div>
  </Card>
)

// Accordion section components
const AccordionSection = ({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) => (
  <Card className={className}>
    {children}
  </Card>
)

const AccordionSectionHeader = ({ children, icon }: { children: ReactNode; icon?: LucideIcon }) => (
  <SectionHeading icon={icon}>{children}</SectionHeading>
)

const AccordionSectionContent = ({
  children,
  defaultValue,
}: {
  children: ReactNode
  defaultValue?: string
}) => (
  <Accordion type="single" collapsible defaultValue={defaultValue}>
    {children}
  </Accordion>
)
