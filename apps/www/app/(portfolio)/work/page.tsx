import Link from "next/link";

const workItems = [
  {
    href: "/work/x-bookmarks",
    title: "X Bookmarks",
    description: "A better way to browse, search, and sort my X bookmarks.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="size-4 fill-foreground"
      >
        <path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z" />
      </svg>
    ),
  },
];

export default function WorkPage() {
  return (
    <div className="py-8 md:py-12 px-2 md:px-4">
      <div className="flex items-center gap-4 mb-6">
        <span className="font-tourney font-semibold uppercase tracking-wider text-xl md:text-2xl">
          Current Projects
        </span>
        <div className="w-3 h-px bg-foreground rounded-full" />
      </div>
      <ul className="mt-6 space-y-2">
        {workItems.map((item) => (
          <li
            key={item.href}
            className="flex items-baseline gap-2 text-sm md:text-base"
          >
            <span className="shrink-0">{item.icon}</span>
            <span>
              <Link
                href={item.href}
                className="text-primary font-semibold underline underline-offset-4 decoration-primary/50 hover:decoration-2 transition-colors"
              >
                {item.title}
              </Link>
              <span className="text-muted-foreground">
                {" "}
                &ndash; {item.description}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
