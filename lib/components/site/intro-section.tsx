import { PreservedQueryLink } from "@/lib/components/site/preserved-query-link";

function PortfolioLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const segment = href.replace(/^\//, "") || "home";
  return (
    <PreservedQueryLink
      href={href}
      data-click-id={`intro:${segment}`}
      className="text-accent text-medium underline underline-offset-4 hover:text-accent/80 transition-colors"
    >
      {children}
    </PreservedQueryLink>
  );
}

export function IntroSection() {
  return (
    <section className="w-full mt-10 md:mt-14 text-lg">
      <h2
        data-section-heading
        className="relative group text-2xl md:text-3xl font-semibold text-foreground pl-2 py-5"
      >
        <span
          aria-hidden="true"
          className="absolute left-[-20px] top-1/2 -translate-y-1/2 hidden lg:block h-3 w-3 rounded-full bg-accent opacity-0 group-data-[active]:opacity-100 transition-opacity duration-300 pointer-events-none shadow-[0_0_8px_var(--accent)]"
        />
        Welcome.
      </h2>

      <p className="text-md text-foreground my-5 leading-relaxed">
        I&apos;m excited to share the best work of my career with you. My
        portfolio breaks down into 3 parts:
      </p>

      <ol className="p-4 space-y-5 list-decimal text-muted-foreground leading-relaxed pl-8">
        <li>
          <PortfolioLink href="/work">Work</PortfolioLink> — metrics and
          quantitative details from initatives I helped drive
        </li>
        <li>
          <PortfolioLink href="/writing">Writing</PortfolioLink> — projects (no
          users) I share my thinking &amp; projects
        </li>
        <li>
          <PortfolioLink href="/random">Random</PortfolioLink> — everything not
          in 1 or 2.
        </li>
      </ol>

      <p className="text-foreground my-5 leading-loose">
        Take a moment to familiarise yourself with the entire website, if you
        want to learn what my taste is like. Also, if your team obsessed with
        aesthetics and perfectly crafted software design, I'm on the market!
      </p>
    </section>
  );
}
