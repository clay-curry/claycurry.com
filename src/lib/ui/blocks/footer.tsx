import Link from "next/link";
import { cn } from "@/src/lib/utils";
import Github from "../icons/github";

export function Footer({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        "w-full border-t border-border bg-background px-4 py-6 my-20 text-sm",
        className,
      )}
    >
      <div className="mx-auto flex flex-col-reverse sm:flex-row gap-4 max-w-7xl items-center justify-between">
        <div>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Link
              href="https://github.com/clay-curry/claycurry.com"
              className="hover:underline text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              target="_blank"
              rel="noopener"
            >
              <Github />
            </Link>

            <div
              className="border-l h-4 mx-1 self-center"
              aria-hidden="true"
            ></div>

            <Link
              href="https://github.com/clay-curry/claycurry.com/blob/main/LICENSE.md"
              className="hover:underline text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              target="_blank"
              rel="noopener"
            >
              © Clay Curry, 2025 - License
            </Link>
          </span>
        </div>
        <nav aria-label="footer navigation">
          <ul className="flex flex-row gap-6">
            <li>
              <Link
                href="/registry"
                className="hover:underline text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                Registry
              </Link>
            </li>
            <li>
              <Link
                href="/sitemap.xml"
                className="hover:underline text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                Sitemap
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
