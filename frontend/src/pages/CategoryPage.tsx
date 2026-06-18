import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { useArticles } from "@/api/articles";
import { useCategory } from "@/api/categories";
import { ArticleGrid } from "@/components/article/ArticleGrid";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";

const CONTAINER = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12";
const PAGE_SIZE = 12;

export function CategoryPage() {
  const { slug = "" } = useParams();
  const [page, setPage] = useState(1);
  const { data: category, isLoading: loadingCat } = useCategory(slug);
  const { data, isLoading } = useArticles({ category: slug, page, page_size: PAGE_SIZE });

  return (
    <div className={CONTAINER}>
      <nav className="mb-4 text-sm text-muted">
        <Link to="/categories" className="hover:text-foreground">
          Categories
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{category?.name ?? slug}</span>
      </nav>

      {loadingCat ? (
        <Skeleton className="mb-8 h-20 w-full max-w-lg rounded-xl" />
      ) : (
        category && (
          <header className="mb-8 border-l-4 pl-4" style={{ borderColor: category.color }}>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              {category.name}
            </h1>
            <p className="mt-1 text-muted">{category.description}</p>
          </header>
        )
      )}

      <ArticleGrid
        articles={data?.results}
        isLoading={isLoading}
        skeletonCount={6}
        emptyTitle="No articles yet"
        emptyDescription="This category doesn't have any published articles."
      />

      {data && (
        <Pagination page={page} count={data.count} pageSize={PAGE_SIZE} onPage={setPage} />
      )}
    </div>
  );
}
