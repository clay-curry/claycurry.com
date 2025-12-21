export default function Summary({ children }: { children: React.ReactNode }) {
  return (
    <div className=" mt-9 md:mt-12   ">
      <div className="flex items-center gap-4 mb-4 md:mb-6">
        <span className="text-sm font-semibold text-primary uppercase tracking-wider">
          Summary
        </span>
        <div className="h-[1px] flex-grow bg-neutral-300 dark:bg-slate-600"></div>
      </div>
      <div className="text-base md:text-lg leading-relaxed my-4">
        {children}
      </div>
      <div className="flex items-center gap-4 md:mt-6 mt-4">
        <div className="h-[1px] flex-grow bg-neutral-300 dark:bg-slate-600"></div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-light text-primary">
            By Clay Curry.
          </span>
        </div>
      </div>
    </div>
  );
}
