import { Clock, Eye } from "lucide-react";
import { Link } from "react-router-dom";

import { Avatar } from "@/components/ui/Avatar";
import type { ArticleListItem } from "@/lib/types";
import { formatCount, formatRelativeTime } from "@/lib/utils";
import { CategoryChip } from "./CategoryChip";

export function ArticleCard({ article }: { article: ArticleListItem }) {
  return (
    <article className="group relative flex flex-col rounded-[var(--radius-card)] border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow)]">
      <div className="mb-3 flex items-center justify-between">
        {article.category ? (
          <CategoryChip category={article.category} asLink={false} />
        ) : (
          <span />
        )}
        <span className="flex items-center gap-1 text-xs text-muted">
          <Eye className="size-3.5" />
          {formatCount(article.view_count)}
        </span>
      </div>

      <h3 className="font-serif text-xl font-semibold leading-snug text-foreground">
        <Link to={`/wiki/${article.slug}`} className="after:absolute after:inset-0">
          {article.title}
        </Link>
      </h3>

      {article.summary && (
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">
          {article.summary}
        </p>
      )}

      <div className="mt-4 flex items-center gap-2 text-xs text-muted">
        {article.author && (
          <>
            <Avatar
              name={article.author.username}
              src={article.author.avatar}
              className="size-6"
            />
            <span className="font-medium text-foreground">
              {article.author.username}
            </span>
            <span>·</span>
          </>
        )}
        <span className="flex items-center gap-1">
          <Clock className="size-3.5" />
          {article.read_time} min
        </span>
        <span className="ml-auto">{formatRelativeTime(article.updated_at)}</span>
      </div>
    </article>
  );
}
