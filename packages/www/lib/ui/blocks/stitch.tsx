const DashedHorizontalLine = () => (
  <svg className="h-px w-full" preserveAspectRatio="none">
    <line
      className="stroke-zinc-950 dark:stroke-white"
      x1="0"
      x2="100%"
      y1="0.5"
      y2="0.5"
      strokeDasharray="2 2"
      strokeWidth="1.5"
      strokeOpacity="0.1"
      strokeLinejoin="round"
    />
  </svg>
);

const DashedVerticalLine = ({ className = "" }: { className?: string }) => (
  <svg className={`w-px ${className}`} preserveAspectRatio="none">
    <line
      className="stroke-zinc-950 dark:stroke-white"
      x1="0.5"
      x2="0.5"
      y1="0"
      y2="100%"
      strokeDasharray="2 2"
      strokeWidth="1.5"
      strokeOpacity="0.1"
      strokeLinejoin="round"
    />
  </svg>
);

export default function Stitch() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 mx-auto w-full max-w-5xl overflow-hidden"
      aria-hidden="true"
    >
      {/* Vertical lines - positioned using the same grid as content */}
      <div className="grid h-full gap-4.25 px-4 sm:grid-cols-2 sm:px-6 xl:grid-cols-15">
        {/* Left edge */}
        <div className="col-start-1 row-span-full flex justify-start -ml-2.25">
          <DashedVerticalLine className="h-full" />
        </div>

        {/* Second column boundary (sm: col 2, xl: col 6) */}
        <div className="col-start-2 row-span-full hidden sm:flex sm:justify-start xl:col-start-6 -ml-2.25">
          <DashedVerticalLine className="h-full" />
        </div>

        {/* Col 7 boundary (xl only) */}
        <div className="col-start-7 row-span-full hidden xl:flex xl:justify-start -ml-2.25">
          <DashedVerticalLine className="h-full" />
        </div>

        {/* Col 10 boundary (xl only) */}
        <div className="col-start-10 row-span-full hidden xl:flex xl:justify-start -ml-2.25">
          <DashedVerticalLine className="h-full" />
        </div>

        {/* Col 11 boundary (xl only) */}
        <div className="col-start-11 row-span-full hidden xl:flex xl:justify-start -ml-2.25">
          <DashedVerticalLine className="h-full" />
        </div>

        {/* Right edge */}
        <div className="col-start-2 row-span-full flex justify-end sm:col-start-2 xl:col-start-15 mr-2.25">
          <DashedVerticalLine className="h-full" />
        </div>
      </div>

      {/* Horizontal lines - full width, positioned at specific heights */}
      <div className="absolute inset-x-0 top-0 h-full">
        {/* These would need specific top values based on your content rows */}
        {/* For now, showing the pattern at header/content boundaries */}
        <div className="absolute left-0 right-0 top-22">
          <DashedHorizontalLine />
        </div>
        <div className="absolute left-0 right-0 bottom-40">
          <DashedHorizontalLine />
        </div>
      </div>
    </div>
  );
}
