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
    <h1 className="font-anders tracking-wide text-accent text-[42px] font-[1000] tracking-tight">
      {children}
    </h1>
  );
}

function HeroSubtext({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[19px] text-card-foreground font-[1000] mb-16 md:mb-10"
      style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
    >
      {children}
    </p>
  );
}
