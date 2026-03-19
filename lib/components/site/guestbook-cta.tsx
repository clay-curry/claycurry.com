import { PreservedQueryLink } from "@/lib/components/site/preserved-query-link";

export function GuestbookCTA() {
  return (
    <p className="text-foreground mt-6 leading-relaxed">
      Made it this far?{" "}
      <PreservedQueryLink
        href="/contact"
        className="text-accent underline underline-offset-4 hover:text-accent/80 transition-colors"
      >
        Sign my guestbook!
      </PreservedQueryLink>
    </p>
  );
}
