import { ArrowLeft, History } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { useArticle, useArticleRevisions, useRevisionDetail } from "@/api/articles";
import { Markdown } from "@/components/article/Markdown";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn, formatRelativeTime } from "@/lib/utils";

const CONTAINER = "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10";

export function HistoryPage() {
  const { slug = "" } = useParams();
  const { data: article } = useArticle(slug);
  const { data: revisions, isLoading } = useArticleRevisions(slug);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    if (revisions?.results.length && selected === null) {
      setSelected(revisions.results[0].id);
    }
  }, [revisions, selected]);

  const { data: detail } = useRevisionDetail(slug, selected);

  return (
    <div className={CONTAINER}>
      <Link
        to={`/wiki/${slug}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to article
      </Link>

      <header className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Revision history
        </h1>
        <p className="mt-1 text-muted">{article?.title}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[20rem_1fr]">
        {/* Revision list */}
        <div>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : revisions && revisions.results.length > 0 ? (
            <ol className="space-y-2">
              {revisions.results.map((rev, index) => (
                <li key={rev.id}>
                  <button
                    onClick={() => setSelected(rev.id)}
                    className={cn(
                      "w-full rounded-xl border px-4 py-3 text-left transition-colors",
                      selected === rev.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:bg-muted-bg",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Avatar
                          name={rev.editor?.username ?? "?"}
                          src={rev.editor?.avatar}
                          className="size-6"
                        />
                        {rev.editor?.username ?? "Unknown"}
                      </span>
                      {index === 0 && (
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                          latest
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 line-clamp-1 text-sm text-muted">
                      {rev.comment || "No summary"}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {formatRelativeTime(rev.created_at)}
                    </p>
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState icon={History} title="No revisions" />
          )}
        </div>

        {/* Selected revision snapshot */}
        <div className="min-w-0 rounded-2xl border border-border bg-card p-6 lg:p-8">
          {detail ? (
            <>
              <div className="mb-6 border-b border-border pb-4">
                <p className="text-xs uppercase tracking-wide text-muted">
                  Snapshot · {formatRelativeTime(detail.created_at)}
                </p>
                <h2 className="mt-1 font-serif text-2xl font-bold text-foreground">
                  {detail.title}
                </h2>
                {detail.comment && (
                  <p className="mt-1 text-sm italic text-muted">“{detail.comment}”</p>
                )}
              </div>
              <Markdown content={detail.content} />
            </>
          ) : (
            <div className="space-y-3">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
