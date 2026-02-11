import { AppLayout } from "@/lib/components/site/AppLayout";
import { ProfileSidebar } from "@/lib/components/site/profile-sidebar";
import { getSiteNavLinks } from "@/lib/navigation";
import { profileData } from "@/lib/portfolio-data";

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navLinks = getSiteNavLinks();

  return (
    <div className="min-h-screen p-0">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col-reverse lg:flex-row gap-1 sm:gap-4 md:gap-6">
          <ProfileSidebar data={profileData} />
          <AppLayout navLinks={navLinks}>{children}</AppLayout>
        </div>
      </div>
    </div>
  );
}
