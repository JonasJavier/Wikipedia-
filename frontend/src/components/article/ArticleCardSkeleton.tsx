import { Skeleton } from "@/components/ui/Skeleton";

export function ArticleCardSkeleton() {
  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-card p-5">
      <Skeleton className="h-5 w-24 rounded-full" />
      <Skeleton className="mt-4 h-6 w-3/4" />
      <Skeleton className="mt-3 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-5/6" />
      <div className="mt-5 flex items-center gap-2">
        <Skeleton className="size-6 rounded-full" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}
