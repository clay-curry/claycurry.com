import { SkillsSection } from "@/lib/resume";
import {
  ResumeAchievementsSection,
  ResumeEducationSection,
  ResumeExperienceSection,
  ResumeHeader,
  ResumeSummarySection,
} from "@/lib/resume/resume-page-sections";

export default function ResumePage() {
  return (
    <article className="py-8 md:py-12 px-2 md:px-4">
      <section className="flex flex-col items-center w-full">
        <ResumeHeader />
        <ResumeSummarySection />
        <ResumeExperienceSection />
        <ResumeEducationSection />
        <ResumeAchievementsSection />
        <SkillsSection />
      </section>
    </article>
  );
}
