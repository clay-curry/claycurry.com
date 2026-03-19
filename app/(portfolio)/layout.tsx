import { Mail, MapPin } from "lucide-react";
import Image from "next/image";
import type React from "react";
import { GitHubIcon, LinkedInIcon, XIcon } from "@/lib/components/icons";
import { FloatingToolbar } from "@/lib/components/site/floating-toolbar";
import { PageViews } from "@/lib/components/site/page-views";
import { PortfolioNav } from "@/lib/components/site/portfolio-nav";
import { getSiteNavLinks, profileData } from "@/lib/portfolio-data";

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh lg:h-dvh lg:overflow-hidden p-0 mx-auto max-w-7xl">
      <div className="flex min-h-dvh flex-col gap-1 sm:gap-4 md:gap-6 lg:h-full lg:flex-row">
        <MainBody>{children}</MainBody>

      </div>
    </div>
  );
}

interface AsideProfileProps {
  data?: typeof profileData;
}

function MainBody({ children }: { children: React.ReactNode }) {
  const navLinks = getSiteNavLinks();

  return (
    <div className="order-1 w-full border border-border/80 bg-background/95 lg:order-2 lg:my-8 lg:mr-8 lg:flex lg:min-w-0 lg:flex-1 lg:flex-col lg:overflow-hidden">
      <PortfolioNav navLinks={navLinks} />
      <div className="flex justify-between px-2 lg:px-3 py-2 lg:shrink-0">
        <FloatingToolbar />
        <PageViews />
      </div>
      <div className="p-6 backdrop-blur supports-backdrop-filter:bg-background/60 lg:overflow-y-auto lg:flex-1">
        {children}
      </div>
    </div>
  );
}

function AsideProfile({ data = profileData }: AsideProfileProps) {
  return (
    <aside className="order-2 h-fit w-full border border-border/80 bg-background/95 p-4 md:p-6 lg:order-1 lg:my-8 lg:ml-8 lg:w-72 lg:overflow-y-auto lg:shrink-0">
      {/* Profile Image */}
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24 md:w-32 md:h-32 mb-4 md:mb-6">
          <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-accent/20 via-accent/5 to-transparent animate-pulse-slow" />
          <div className="absolute inset-0.5 rounded-3xl bg-secondary overflow-hidden">
            <Image
              src={data.avatar}
              alt={data.name}
              fill
              className="object-cover"
            />
          </div>
        </div>

        <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1">
          {data.name}
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground bg-secondary px-3 md:px-4 py-1 rounded-lg">
          {data.title}
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-border my-4 md:my-6" />

      {/* Contact Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 md:gap-4">
        {[
          {
            icon: MapPin,
            label: "Location",
            value: data.location,
            href: data.locationHref,
            clickId: "sidebar:location",
          },
          {
            icon: Mail,
            label: "Email",
            value: data.email,
            href: `mailto:${data.email}`,
            breakAll: true,
            clickId: "sidebar:email",
          },
        ].map(({ icon: Icon, label, value, href, breakAll, clickId }) => (
          <div key={label} className="flex items-start gap-3 pl-2">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className={`flex-1${breakAll ? " min-w-0" : ""}`}>
              <p className="text-xs text-muted-foreground uppercase mb-1">
                {label}
              </p>
              {href ? (
                <a
                  href={href}
                  data-click-id={clickId}
                  className={`text-sm text-foreground hover:text-accent transition-colors${breakAll ? " break-all" : ""}`}
                >
                  {value}
                </a>
              ) : (
                <p className="text-sm text-foreground">{value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4 mt-4 md:mt-6 pt-4 md:pt-6 border-t border-border">
        {[
          {
            href: data.social.x,
            label: "X",
            clickId: "sidebar:x",
            icon: XIcon,
          },
          {
            href: data.social.github,
            label: "GitHub",
            clickId: "sidebar:github",
            icon: GitHubIcon,
          },
          {
            href: data.social.linkedin,
            label: "LinkedIn",
            clickId: "sidebar:linkedin",
            icon: LinkedInIcon,
          },
        ].map(({ href, label, clickId, icon: Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            data-click-id={clickId}
            aria-label={label}
            className="w-10 h-10 rounded-lg bg-secondary hover:bg-accent hover:text-accent-foreground hover:scale-110 focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:scale-110 transition-all flex items-center justify-center"
          >
            <Icon className="w-5 h-5" />
          </a>
        ))}
      </div>
    </aside>
  );
}
