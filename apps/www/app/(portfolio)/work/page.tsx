import { ArrowRight } from "lucide-react";
import Link from "next/link";

const workItems = [
  {
    href: "/work/x-bookmarks",
    title: "X Bookmarks",
    description: "A curated collection of posts I've bookmarked on X.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="size-6 fill-foreground shrink-0"
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

export default function WorkPage() {
  return (
    <div className="py-8 md:py-12 px-2 md:px-4">
      <div className="flex items-center gap-4 mb-6">
        <span className="font-tourney font-semibold uppercase tracking-wider text-xl md:text-2xl">
          What I do
        </span>
        <div className="w-3 h-px bg-foreground rounded-full" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mt-10">
        {workItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-secondary rounded-xl md:rounded-2xl border border-border hover:border-accent hover:shadow-lg transition-all p-6 flex items-center gap-4 group"
          >
            {item.icon}
            <div className="flex-1 min-w-0">
              <h2 className="font-sans font-semibold tracking-wider text-lg md:text-xl">
                {item.title}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                {item.description}
              </p>
            </div>
            <ArrowRight className="size-5 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
