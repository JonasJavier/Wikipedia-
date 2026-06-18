import { Search } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useArticles } from "@/api/articles";
import { ArticleGrid } from "@/components/article/ArticleGrid";
import { SearchBar } from "@/components/layout/SearchBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";

const CONTAINER = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12";
const PAGE_SIZE = 12;

export function SearchPage() {
  const [params] = useSearchParams();
  const query = params.get("q")?.trim() ?? "";
  const [page, setPage] = useState(1);

  const { data, isLoading } = useArticles(
    query ? { search: query, page, page_size: PAGE_SIZE } : {},
  );

  return (
    <div className={CONTAINER}>
      <div className="mx-auto mb-8 max-w-2xl">
        <SearchBar large defaultValue={query} key={query} />
      </div>

      {!query ? (
        <EmptyState
          icon={Search}
          title="Search Wikiverse"
          description="Type a topic above to find articles."
        />
      ) : (
        <>
          <h1 className="mb-6 text-lg text-muted">
            {data ? (
              <>
                <span className="font-semibold text-foreground">{data.count}</span>{" "}
                result{data.count === 1 ? "" : "s"} for{" "}
                <span className="font-semibold text-foreground">“{query}”</span>
              </>
            ) : (
              "Searching…"
            )}
          </h1>
          <ArticleGrid
            articles={data?.results}
            isLoading={isLoading}
            skeletonCount={6}
            emptyTitle={`No results for “${query}”`}
            emptyDescription="Try different keywords or browse by category."
          />
          {data && (
            <Pagination
              page={page}
              count={data.count}
              pageSize={PAGE_SIZE}
              onPage={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
