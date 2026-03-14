import { Skeleton } from "@/lib/components/ui/skeleton";

export function BookmarkCardSkeleton() {
  return (
    <div className="bg-secondary rounded-xl md:rounded-2xl border border-border p-4 md:p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="size-8 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2.5 w-16" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      <Skeleton className="h-32 w-full rounded-lg" />
      <div className="flex gap-4">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}
