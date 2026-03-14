"use client";

import { eachDayOfInterval, formatISO, parseISO, subYears } from "date-fns";
import { Activity as ActivityIcon } from "lucide-react";
import { useMemo, useState } from "react";
import {
  type Activity,
  ContributionGraph,
  ContributionGraphBlock,
  ContributionGraphCalendar,
  ContributionGraphFooter,
  ContributionGraphLegend,
} from "@/lib/components/ui/contribution-graph";
import { SectionHeading } from "@/lib/resume/components";
import { cn } from "@/lib/utils";

const BLOCK_SIZE = 10;
const BLOCK_MARGIN = 3;
const FONT_SIZE = 14;
const LABEL_MARGIN = 8;
const LABEL_HEIGHT = FONT_SIZE + LABEL_MARGIN;
const DAY_LABEL_WIDTH = 30;

const DAY_LABELS = [
  { label: "Mon", dayIndex: 1 },
  { label: "Wed", dayIndex: 3 },
  { label: "Fri", dayIndex: 5 },
] as const;

function padToFullYear(contributions: Activity[], year: number): Activity[] {
  const today = new Date();
  const isCurrentYear = year === today.getFullYear();

  const startDate = isCurrentYear
    ? subYears(today, 1)
    : parseISO(`${year}-01-01`);
  const endDate = isCurrentYear ? today : parseISO(`${year}-12-31`);

  const startStr = formatISO(startDate, { representation: "date" });
  const endStr = formatISO(endDate, { representation: "date" });

  const map = new Map<string, Activity>();
  for (const c of contributions) {
    if (
      isCurrentYear
        ? c.date >= startStr && c.date <= endStr
        : c.date.startsWith(String(year))
    ) {
      map.set(c.date, c);
    }
  }

  return eachDayOfInterval({ start: startDate, end: endDate }).map((day) => {
    const date = formatISO(day, { representation: "date" });
    return map.get(date) ?? { date, count: 0, level: 0 };
  });
}

function DayLabelsSvg() {
  const height = LABEL_HEIGHT + (BLOCK_SIZE + BLOCK_MARGIN) * 7 - BLOCK_MARGIN;
  return (
    <svg
      width={DAY_LABEL_WIDTH}
      height={height}
      className="shrink-0 hidden sm:block"
    >
      {DAY_LABELS.map(({ label, dayIndex }) => (
        <text
          key={label}
          x={DAY_LABEL_WIDTH - 4}
          y={
            LABEL_HEIGHT +
            (BLOCK_SIZE + BLOCK_MARGIN) * dayIndex +
            BLOCK_SIZE / 2
          }
          textAnchor="end"
          dominantBaseline="central"
          className="fill-muted-foreground"
          fontSize={FONT_SIZE - 3}
        >
          {label}
        </text>
      ))}
    </svg>
  );
}

function YearSelector({
  years,
  selectedYear,
  onSelect,
}: {
  years: number[];
  selectedYear: number;
  onSelect: (year: number) => void;
}) {
  return (
    <div className="flex flex-col items-end gap-1 shrink-0 pl-3">
      {years.map((year) => (
        <button
          key={year}
          type="button"
          onClick={() => onSelect(year)}
          className={cn(
            "text-xs font-bold tabular-nums px-3 py-1.5 rounded-full transition-colors",
            year === selectedYear
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {year}
        </button>
      ))}
    </div>
  );
}

export function ContributionGraphClient({
  allContributions,
  yearTotals,
  availableYears,
}: {
  allContributions: Activity[];
  yearTotals: Record<string, number>;
  availableYears: number[];
}) {
  const [selectedYear, setSelectedYear] = useState(() =>
    new Date().getFullYear(),
  );

  const paddedData = useMemo(
    () => padToFullYear(allContributions, selectedYear),
    [allContributions, selectedYear],
  );

  const isCurrentYear = selectedYear === new Date().getFullYear();
  const totalCount = isCurrentYear
    ? paddedData.reduce((sum, d) => sum + d.count, 0)
    : (yearTotals[String(selectedYear)] ?? 0);

  return (
    <div className="w-full mt-10 md:mt-14">
      <SectionHeading
        icon={<ActivityIcon className="w-5 h-5 md:w-6 md:h-6 text-accent" />}
      >
        Contributions
      </SectionHeading>
      <p className="text-muted-foreground mb-2">
        {totalCount} contributions{" "}
        {isCurrentYear ? "in the last year" : `in ${selectedYear}`}
      </p>
      <ContributionGraph
        data={paddedData}
        blockSize={BLOCK_SIZE}
        blockMargin={BLOCK_MARGIN}
        blockRadius={2}
        fontSize={FONT_SIZE}
        totalCount={totalCount}
        labels={{
          totalCount: "{{count}} contributions in {{year}}",
        }}
      >
        <div className="flex items-start">
          <div className="p-2 md:p-4 rounded-xl bg-secondary border border-border/65 min-w-0 flex-1">
            <div className="flex items-start">
              <DayLabelsSvg />
              <div className="flex-1 min-w-0">
                <ContributionGraphCalendar>
                  {(props) => <ContributionGraphBlock {...props} />}
                </ContributionGraphCalendar>
              </div>
            </div>
            <ContributionGraphFooter className="mt-2">
              <ContributionGraphLegend />
            </ContributionGraphFooter>
          </div>
          <YearSelector
            years={availableYears}
            selectedYear={selectedYear}
            onSelect={setSelectedYear}
          />
        </div>
      </ContributionGraph>
    </div>
  );
}
