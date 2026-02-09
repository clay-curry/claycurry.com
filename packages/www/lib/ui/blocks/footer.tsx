import Link from "next/link";
import { cn } from "@/lib/utils";

export function Footer({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        "px-4 py-6 mt-20 mb-5 text-sm border-t border-border bg-background",
        className,
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-center">
        <span className="flex items-center gap-1 text-muted-foreground">
          <Link
            href="https://github.com/clay-curry/claycurry.com/blob/main/LICENSE.md"
            className="hover:underline text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            target="_blank"
            rel="noopener"
          >
            © Clay Curry, 2026 - License
          </Link>
        </span>
      </div>
    </footer>
  );
}
