export default function Summary({ children }: { children: React.ReactNode }) {
  return (
    <div className=" my-9 md:mt-18   ">
      <div className="flex items-center gap-4 mb-4 md:mb-6">
        <span className="text-sm font-semibold text-link uppercase tracking-wider">
          Summary
        </span>
        <div className="h-[1px] flex-grow bg-border"></div>
      </div>
      <div className="text-base md:text-lg leading-relaxed my-4">
        {children}
      </div>
      <div className="flex items-center gap-4 md:mt-6 mt-4">
        <div className="h-[1px] flex-grow bg-border"></div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-light text-link">
            By Clay Curry.
          </span>
        </div>
      </div>
    </div>
  );
}
