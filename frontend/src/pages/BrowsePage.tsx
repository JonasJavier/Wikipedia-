import { useState } from "react";

import { useArticles } from "@/api/articles";
import { useCategories } from "@/api/categories";
import { ArticleGrid } from "@/components/article/ArticleGrid";
import { Pagination } from "@/components/ui/Pagination";
import { cn } from "@/lib/utils";

const CONTAINER = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12";
const PAGE_SIZE = 12;

const SORTS = [
  { value: "-updated_at", label: "Recently updated" },
  { value: "-created_at", label: "Newest" },
  { value: "-view_count", label: "Most viewed" },
  { value: "title", label: "A–Z" },
];

export function BrowsePage() {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("");
  const [ordering, setOrdering] = useState("-updated_at");

  const { data: categories } = useCategories();
  const { data, isLoading, isFetching } = useArticles({
    page,
    page_size: PAGE_SIZE,
    ordering,
    category: category || undefined,
  });

  return (
    <div className={CONTAINER}>
      <header className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Browse articles
        </h1>
        <p className="mt-1 text-muted">
          {data ? `${data.count} articles` : "Explore the encyclopedia"}
        </p>
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <FilterChip active={category === ""} onClick={() => { setCategory(""); setPage(1); }}>
          All
        </FilterChip>
        {categories?.map((c) => (
          <FilterChip
            key={c.id}
            active={category === c.slug}
            onClick={() => { setCategory(c.slug); setPage(1); }}
          >
            {c.name}
          </FilterChip>
        ))}
        <select
          value={ordering}
          onChange={(e) => { setOrdering(e.target.value); setPage(1); }}
          className="ml-auto h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className={cn(isFetching && !isLoading && "opacity-60 transition-opacity")}>
        <ArticleGrid articles={data?.results} isLoading={isLoading} skeletonCount={12} />
      </div>

      {data && (
        <Pagination
          page={page}
          count={data.count}
          pageSize={PAGE_SIZE}
          onPage={setPage}
        />
      )}
    </div>
  );
}

function FilterChip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
