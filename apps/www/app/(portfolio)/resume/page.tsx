import {
  Award,
  BookOpen,
  Briefcase,
  GithubIcon,
  LinkedinIcon,
  Mail,
  MapPin,
} from "lucide-react";
import { XIcon } from "@/lib/components/icons";
import {
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
import { profileData } from "@/lib/portfolio-data";
import {
  AccordionHeader,
  AccordionSection,
  AccordionSectionContent,
  AccordionSectionHeader,
  HeaderName,
  HeaderSection,
  HeaderSocialLink,
  HeaderSocialLinks,
  HeaderTitle,
  PrimaryLink,
  SkillsSection,
} from "@/lib/resume";

export default function ResumePage() {
  return (
    <article className="py-8 md:py-12 px-2 md:px-4">
      <section className="flex flex-col items-center w-full">
        {/* Header */}
        <HeaderSection>
          <HeaderName>Clay Curry</HeaderName>
          <HeaderTitle>Product Engineer</HeaderTitle>
          <HeaderSocialLinks>
            <HeaderSocialLink
              icon={<MapPin className="size-4" />}
              href="https://www.google.com/maps/place/San+Francisco,+CA"
              label="Location"
              clickId="resume:location"
            />
            <HeaderSocialLink
              icon={<Mail className="size-4" />}
              href={`mailto:${profileData.email}`}
              label="Email"
              clickId="resume:email"
            />
            <HeaderSocialLink
              icon={<XIcon className="size-4" />}
              href={profileData.social.x}
              label="X"
              clickId="resume:x"
            />
            <HeaderSocialLink
              icon={<GithubIcon className="size-4" />}
              href={profileData.social.github}
              label="GitHub"
              clickId="resume:github"
            />
            <HeaderSocialLink
              icon={<LinkedinIcon className="size-4" />}
              href={profileData.social.linkedin}
              label="LinkedIn"
              clickId="resume:linkedin"
            />
          </HeaderSocialLinks>
        </HeaderSection>

        {/* Objective */}
        <AccordionSection>
          <AccordionSectionHeader
            icon={<Briefcase className="w-5 h-5 md:w-6 md:h-6 text-accent" />}
          >
            Summary
          </AccordionSectionHeader>
          <AccordionSectionContent>
            <p className="pb-4">TL;DR:</p>
            <ul className="pb-4 list-disc pl-4 gap-4 grid">
              <li>
                I am a product engineer with a strong bias toward getting shit
                done.
              </li>
              <li>
                Actively looking to join early-to-mid stage startups or
                fast-growing teams.
              </li>
              <li>
                <div>Got any tedious work but too busy to automate it?</div>
                <div>
                  I built my first data pipeline before I could legally drive.
                </div>
              </li>
            </ul>
          </AccordionSectionContent>
        </AccordionSection>

        {/* Professional Experience */}
        <AccordionSection>
          <AccordionSectionHeader
            icon={<Briefcase className="w-5 h-5 md:w-6 md:h-6 text-accent" />}
          >
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
                      "Shipped 2 plugins consumed by amazon.com's real-time offer recommendation engine, handling billions of requests per day.",
                      "Launched a used-book offer recommendation feature driving $30.2MM in revenue growth and 9.7MM additional annualized units sold.",
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
          <AccordionSectionHeader
            icon={<BookOpen className="w-5 h-5 md:w-6 md:h-6 text-accent" />}
          >
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
          <AccordionSectionHeader
            icon={<Award className="w-5 h-5 md:w-6 md:h-6 text-accent" />}
          >
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
        <SkillsSection />
      </section>
    </article>
  );
}
