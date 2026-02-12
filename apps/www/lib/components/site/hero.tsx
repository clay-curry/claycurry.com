import { HeroContactAskAI } from "@/lib/components/chat/hero-contact-ask-ai";

export function Hero() {
  return (
    <div className="text-center py-20">
      <HeroPrimaryText>Clay Curry</HeroPrimaryText>
      <HeroSubtext>PortfolioWebsite</HeroSubtext>
      <HeroContactAskAI />
    </div>
  );
}

function HeroPrimaryText({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="font-anders tracking-wider text-accent text-[42px] md:text-6xl font-bold tracking-tight">
      {children}
    </h1>
  );
}

function HeroSubtext({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[19px] text-card-foreground font-[1000] mb-18 md:mb-10"
      style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
    >
      {children}
    </p>
  );
}
