import { PreservedQueryLink } from "@/lib/components/site/preserved-query-link";

const workItems = [
  {
    href: "/work/x-bookmarks",
    title: "X Bookmarks",
    description: "clone for X bookmarks, with more navigations tools",
    year: 2025,
    icon: (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="size-4 fill-foreground shrink-0"
      >
        <g>
          <path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"></path>
        </g>
      </svg>
    ),
  },
];

export default function WorkPage() {
  return (
    <div className="py-8 md:py-12 px-2 md:px-4 min-h-24">
      <ul className="space-y-10">
        {workItems.map((item) => (
          <li key={item.href}>
            <PreservedQueryLink
              href={item.href}
              className="group flex items-center gap-3"
            >
              <span className="shrink-0 self-center">{item.icon}</span>
              <span className="font-bold text-foreground shrink-0">
                {item.title}
              </span>
              <span className="text-muted-foreground hidden sm:inline truncate min-w-0">
                {item.description}
              </span>
              <span className="flex-1 min-w-8 border-b border-muted-foreground/30" />
              <span className="text-muted-foreground shrink-0 tabular-nums">
                {item.year}
              </span>
            </PreservedQueryLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
