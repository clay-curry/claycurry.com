import { HeroContactAskAI } from "@/lib/components/chat/hero-contact-ask-ai";

function HeroPrimaryText({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="font-tourney text-accent text-4xl md:text-6xl font-bold tracking-tight mb-4">
      {children}
    </h1>
  );
}

function HeroSubtext({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-lg md:text-xl text-muted-foreground italic mb-18 md:mb-10">
      {children}
    </p>
  );
}

export function Hero() {
  return (
    <div className="text-center py-20">
      <HeroPrimaryText>Clay Curry</HeroPrimaryText>
      <HeroSubtext>PORTFOLIO WEBSITE</HeroSubtext>
      <HeroContactAskAI />
    </div>
  );
}
