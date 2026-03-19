import { ArrowRight } from "lucide-react";
import { PreservedQueryLink } from "@/lib/components/site/preserved-query-link";

export function ProjectCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <PreservedQueryLink
      href={href}
      data-click-id={`project:${title.toLowerCase().replace(/\s+/g, "-")}`}
      className="bg-secondary rounded-xl md:rounded-2xl border border-border hover:border-accent hover:shadow-lg transition-all p-6 flex items-center gap-4 group"
    >
      <div className="shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <h2 className="font-sans font-semibold tracking-wider text-lg md:text-xl">
          {title}
        </h2>
        <p className="text-muted-foreground text-sm mt-1">{description}</p>
      </div>
      <ArrowRight className="size-5 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
    </PreservedQueryLink>
  );
}
