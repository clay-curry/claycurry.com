import { BookOpen } from "lucide-react";
import { Guestbook } from "@/lib/components/site/guestbook";
import { NAV_MAP, PageNav } from "@/lib/components/site/page-nav";

export default function RandomPage() {
  return (
    <div className="py-8 md:py-12 px-2 md:px-4 flex flex-col gap-12 md:gap-14">
      <div>
        <div className="flex items-center gap-4 mb-6">
          <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
          <span className="font-geist font-semibold uppercase tracking-wider text-xl md:text-2xl">
            Guestbook
          </span>
          <div className="w-3 h-px bg-foreground rounded-full" />
        </div>
      </div>

      <Guestbook />

      <PageNav prev={NAV_MAP["/random"].prev} next={NAV_MAP["/random"].next} />
    </div>
  );
}
