import { Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import type React from "react";
import { FloatingToolbar } from "@/lib/components/site/floating-toolbar";
import { PageViews } from "@/lib/components/site/page-views";
import { PortfolioNav } from "@/lib/components/site/portfolio-nav";
import { getSiteNavLinks } from "@/lib/navigation";
import { profileData } from "@/lib/portfolio-data";

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen p-0 mx-auto max-w-7xl">
      <div className="flex flex-col-reverse lg:flex-row gap-1 sm:gap-4 md:gap-6">
        <AsideProfile data={profileData} />
        <MainBody>{children}</MainBody>
      </div>
    </div>
  );
}

interface AsideProfileProps {
  data?: typeof profileData;
}

export function MainBody({ children }: { children: React.ReactNode }) {
  const navLinks = getSiteNavLinks();

  return (
    <div className="w-full border border-border/80 lg:my-8 lg:mr-8 bg-background/95">
      <PortfolioNav navLinks={navLinks} />
      <div className="flex justify-between px-2 lg:px-3 py-2">
        <FloatingToolbar />
        <PageViews />
      </div>
      <div className="p-2 lg:p-3 backdrop-blur supports-backdrop-filter:bg-background/60">
        {children}
      </div>
    </div>
  );
}

export function AsideProfile({ data = profileData }: AsideProfileProps) {
  return (
    <aside className="w-full h-fit lg:w-96 bg-background/95 border border-border/80 p-4 md:p-6 lg:sticky lg:top-8 lg:my-8 lg:ml-8 overflow-none">
      {/* Profile Image */}
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24 md:w-32 md:h-32 mb-4 md:mb-6">
          <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-accent/20 via-accent/5 to-transparent animate-pulse-slow" />
          <div className="absolute inset-0.5 rounded-3xl bg-secondary overflow-hidden">
            <Image
              src={data.avatar || "/placeholder.svg"}
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
            href: "https://www.google.com/maps/place/San+Francisco,+CA",
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
          {
            icon: Phone,
            label: "Phone",
            value: data.phone,
            href: `tel:${data.phone.replace(/\s/g, "")}`,
            clickId: "sidebar:phone",
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
    </aside>
  );
}
