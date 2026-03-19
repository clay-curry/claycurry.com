import { PreservedQueryLink } from "@/lib/components/site/preserved-query-link";

function PortfolioLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <PreservedQueryLink
      href={href}
      className="text-accent text-medium underline underline-offset-4 hover:text-accent/80 transition-colors"
    >
      {children}
    </PreservedQueryLink>
  );
}

export function IntroSection() {
  return (
    <section className="w-full mt-10 md:mt-14">
      <h2 className="text-2xl md:text-3xl font-semibold text-foreground py-5">
        Welcome.
      </h2>

      <p className="text-foreground my-5 leading-relaxed">
        I&apos;m excited to share the best work of my career with you. My
        portfolio breaks down into 3 parts:
      </p>

      <ol className="p-4 space-y-5 list-decimal list-inside text-muted-foreground leading-relaxed">
        <li>
          <PortfolioLink href="/work">Work</PortfolioLink> — metrics and
          quantitative details collected from work I helped drive
        </li>
        <li>
          <PortfolioLink href="/writing">Writing</PortfolioLink> — projects (no
          users) I share my thinking &amp; projects
        </li>
        <li>
          <span className="text-foreground font-medium">Random</span> —
          everything else
        </li>
      </ol>

      <p className="text-foreground mt-2 leading-relaxed">
        I am obsessed with helping teams stand out with aesthetics and perfectly
        crafted design.
      </p>
    </section>
  );
}
