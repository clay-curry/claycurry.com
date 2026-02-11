import { AppLayout } from "@/lib/components/site/AppLayout";
import { getSiteNavLinks } from "@/lib/navigation";

export default function ResumeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navLinks = getSiteNavLinks();

  return (
    <div className="min-h-screen p-0">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col-reverse lg:flex-row gap-1 sm:gap-4 md:gap-6">
          <AppLayout navLinks={navLinks}>{children}</AppLayout>
        </div>
      </div>
    </div>
  );
}
