import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { useCategories } from "@/api/categories";
import { Skeleton } from "@/components/ui/Skeleton";

const CONTAINER = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12";

export function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();

  return (
    <div className={CONTAINER}>
      <header className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">Categories</h1>
        <p className="mt-1 text-muted">Browse articles grouped by topic.</p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-2xl" />
            ))
          : categories?.map((c) => (
              <Link
                key={c.id}
                to={`/category/${c.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow)]"
                style={{ borderTopColor: c.color, borderTopWidth: 3 }}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">{c.name}</h2>
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    style={{
                      color: c.color,
                      background: `color-mix(in srgb, ${c.color} 14%, transparent)`,
                    }}
                  >
                    {c.article_count}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-muted">{c.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary transition-all group-hover:gap-2">
                  Explore <ArrowRight className="size-4" />
                </span>
              </Link>
            ))}
      </div>
    </div>
  );
}
