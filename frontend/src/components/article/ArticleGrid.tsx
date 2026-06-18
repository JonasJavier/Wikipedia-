import { FileQuestion } from "lucide-react";

import { EmptyState } from "@/components/ui/EmptyState";
import type { ArticleListItem } from "@/lib/types";
import { ArticleCard } from "./ArticleCard";
import { ArticleCardSkeleton } from "./ArticleCardSkeleton";

interface Props {
  articles?: ArticleListItem[];
  isLoading: boolean;
  skeletonCount?: number;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function ArticleGrid({
  articles,
  isLoading,
  skeletonCount = 6,
  emptyTitle = "No articles found",
  emptyDescription = "Try a different search or category.",
}: Props) {
  if (isLoading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ArticleCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <EmptyState
        icon={FileQuestion}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
