export default function Summary({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-9 md:mt-18">
      <div className="flex items-center gap-4 mb-4 md:mb-6">
        <div className="h-px w-8 bg-border"></div>
        <span className="text-sm font-semibold text-primary uppercase tracking-wider">
          Summary
        </span>
        <div className="h-px flex-grow bg-border"></div>
      </div>
      <div className="text-base md:text-lg leading-relaxed my-4 text-card-foreground">
        {children}
      </div>
      <div className="flex items-center gap-4 md:mt-6 mt-4">
        <div className="h-px flex-grow bg-border"></div>
        <span className="text-sm font-light text-primary">By Clay Curry.</span>
        <div className="h-px w-8 bg-border"></div>
      </div>
    </div>
  );
}
