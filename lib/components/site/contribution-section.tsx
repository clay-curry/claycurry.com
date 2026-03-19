import type { Activity } from "@/lib/components/ui/contribution-graph";
import { ContributionGraphClient } from "./contribution-graph-client";

export async function ContributionSection() {
  let contributions: Activity[] = [];
  let total: Record<string, number> = {};

  try {
    const res = await fetch(
      "https://github-contributions-api.jogruber.de/v4/claycurry",
      { next: { revalidate: 86400 } },
    );
    const json = await res.json();
    contributions = json.contributions ?? [];
    total = json.total ?? {};
  } catch {
    return null;
  }

  const availableYears = Object.keys(total)
    .map(Number)
    .filter((y) => total[String(y)] > 0)
    .sort((a, b) => b - a);

  if (contributions.length === 0) return null;

  return (
    <ContributionGraphClient
      allContributions={contributions}
      yearTotals={total}
      availableYears={availableYears}
    />
  );
}
