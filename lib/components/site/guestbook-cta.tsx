import { PreservedQueryLink } from "@/lib/components/site/preserved-query-link";

export function GuestbookCTA() {
  return (
    <p className="text-foreground mb-6 leading-relaxed text-center">
      Made it this far?{" "}
      <PreservedQueryLink
        href="/random"
        data-click-id="footer:guestbook"
        className="text-accent underline underline-offset-4 hover:text-accent/80 transition-colors"
      >
        Sign my guestbook!
      </PreservedQueryLink>
    </p>
  );
}
