import { HeroContactAskAI } from "@/lib/components/chat/hero-contact-ask-ai";

function HeroName() {
  return (
    <h1 className="font-anders tracking-wide text-accent text-[42px] font-[1000]">
      Clay Curry
    </h1>
  );
}

function Subtitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`text-foreground font-[1000] text-[24px] font-[var(--font-pp-neue-montreal)] ${className ?? ""}`}
    >
      {children}
    </p>
  );
}

function HeroSubtitles() {
  return (
    <div className="mt-2 mb-16 md:mb-10 min-h-[40px]">
      <Subtitle>PRODUCT ENGINEER</Subtitle>
    </div>
  );
}

export function Hero() {
  return (
    <div className="text-center py-20">
      <HeroName />
      <HeroSubtitles />
      <HeroContactAskAI />
    </div>
  );
}
