import {
  Award,
  BookOpen,
  Briefcase,
  GithubIcon,
  LinkedinIcon,
  Mail,
  MapPin,
} from "lucide-react";
import type { ReactNode } from "react";
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
} from "./components";
import {
  type ResumeOrganizationData,
  type ResumeSocialIcon,
  resumeAchievementItems,
  resumeEducationItems,
  resumeExperienceItems,
  resumeHeaderData,
  resumeSummaryPoints,
} from "./resume-page-data";

const SECTION_ICON_CLASS = "w-5 h-5 md:w-6 md:h-6 text-accent";

function renderSocialIcon(icon: ResumeSocialIcon): ReactNode {
  switch (icon) {
    case "location":
      return <MapPin className="size-4" />;
    case "email":
      return <Mail className="size-4" />;
    case "x":
      return <XIcon className="size-4" />;
    case "github":
      return <GithubIcon className="size-4" />;
    case "linkedin":
      return <LinkedinIcon className="size-4" />;
    default:
      return null;
  }
}

function ExperienceOrganization({
  organization,
}: {
  organization: ResumeOrganizationData;
}) {
  if (organization.link) {
    return (
      <div className="flex flex-col md:flex-row gap-1 text-card-foreground">
        <span>
          {organization.prefix}
          <CVLink href={organization.link.href}>
            {organization.link.label}
          </CVLink>
        </span>
      </div>
    );
  }

  return <>{organization.text}</>;
}

export function ResumeHeader() {
  return (
    <HeaderSection>
      <HeaderName>{resumeHeaderData.name}</HeaderName>
      <HeaderTitle>{resumeHeaderData.title}</HeaderTitle>
      <HeaderSocialLinks>
        {resumeHeaderData.socialLinks.map((socialLink) => (
          <HeaderSocialLink
            key={socialLink.clickId}
            icon={renderSocialIcon(socialLink.icon)}
            href={socialLink.href}
            label={socialLink.label}
            clickId={socialLink.clickId}
          />
        ))}
      </HeaderSocialLinks>
    </HeaderSection>
  );
}

export function ResumeSummarySection() {
  return (
    <AccordionSection>
      <AccordionSectionHeader
        icon={<Briefcase className={SECTION_ICON_CLASS} />}
      >
        Summary
      </AccordionSectionHeader>
      <AccordionSectionContent>
        <ul className="pb-4 list-disc pl-4 gap-4 grid">
          {resumeSummaryPoints.map((summaryPoint) => (
            <li key={summaryPoint}>{summaryPoint}</li>
          ))}
        </ul>
      </AccordionSectionContent>
    </AccordionSection>
  );
}

export function ResumeExperienceSection() {
  return (
    <AccordionSection>
      <AccordionSectionHeader
        icon={<Briefcase className={SECTION_ICON_CLASS} />}
      >
        Experience
      </AccordionSectionHeader>
      <AccordionSectionContent autoOpenValue="item-1">
        {resumeExperienceItems.map((experienceItem) => (
          <AccordionItem key={experienceItem.id} value={experienceItem.id}>
            <AccordionTrigger
              data-click-id={experienceItem.clickId}
              className="font-semibold text-muted-foreground"
            >
              <AccordionHeader
                title={experienceItem.title}
                date={experienceItem.date}
              />
            </AccordionTrigger>
            <AccordionContent>
              <CVContentBody>
                <CVOrgLocation
                  org={
                    <ExperienceOrganization
                      organization={experienceItem.organization}
                    />
                  }
                  location={experienceItem.organization.location}
                />
                <CVBulletList items={experienceItem.bullets} />
              </CVContentBody>
            </AccordionContent>
          </AccordionItem>
        ))}
      </AccordionSectionContent>
    </AccordionSection>
  );
}

export function ResumeEducationSection() {
  return (
    <AccordionSection>
      <AccordionSectionHeader
        icon={<BookOpen className={SECTION_ICON_CLASS} />}
      >
        Education
      </AccordionSectionHeader>
      <AccordionSectionContent>
        {resumeEducationItems.map((educationItem) => (
          <AccordionItem key={educationItem.id} value={educationItem.id}>
            <AccordionTrigger
              data-click-id={educationItem.clickId}
              className="font-semibold text-muted-foreground"
            >
              <AccordionHeader
                title={educationItem.title}
                date={educationItem.date}
              />
            </AccordionTrigger>
            <AccordionContent>
              <CVContentBody>
                <p>{educationItem.minor}</p>
                <CVBulletList
                  items={educationItem.roles.map((role) => (
                    <div key={role.key}>
                      <div>{role.role}</div>
                      <div>
                        Advisor:{" "}
                        <CVLink href={role.advisorHref}>
                          {role.advisorName}
                        </CVLink>
                      </div>
                    </div>
                  ))}
                />
              </CVContentBody>
            </AccordionContent>
          </AccordionItem>
        ))}
      </AccordionSectionContent>
    </AccordionSection>
  );
}

export function ResumeAchievementsSection() {
  return (
    <AccordionSection>
      <AccordionSectionHeader icon={<Award className={SECTION_ICON_CLASS} />}>
        Awards and Certifications
      </AccordionSectionHeader>
      <AccordionSectionContent>
        {resumeAchievementItems.map((achievement) => (
          <AccordionItem key={achievement.id} value={achievement.id}>
            <AccordionTrigger
              data-click-id={achievement.clickId}
              className="font-semibold text-muted-foreground"
            >
              <AccordionHeader
                title={achievement.title}
                date={achievement.date}
              />
            </AccordionTrigger>
            <AccordionContent>
              <CVContentBody>
                <CVRowItem label="Issued by">{achievement.issuedBy}</CVRowItem>
                {achievement.description.map((descriptionLine) => (
                  <p key={descriptionLine}>{descriptionLine}</p>
                ))}
                {achievement.legacyProgramLink && (
                  <p>
                    (formerly{" "}
                    <PrimaryLink href={achievement.legacyProgramLink.href}>
                      {achievement.legacyProgramLink.label}
                    </PrimaryLink>
                    )
                  </p>
                )}
                {achievement.verifyLink && (
                  <PrimaryLink href={achievement.verifyLink.href}>
                    {achievement.verifyLink.label}
                  </PrimaryLink>
                )}
              </CVContentBody>
            </AccordionContent>
          </AccordionItem>
        ))}
      </AccordionSectionContent>
    </AccordionSection>
  );
}
