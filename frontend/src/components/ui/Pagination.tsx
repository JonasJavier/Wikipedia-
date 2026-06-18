import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface Props {
  page: number;
  count: number;
  pageSize: number;
  onPage: (page: number) => void;
}

export function Pagination({ page, count, pageSize, onPage }: Props) {
  const totalPages = Math.ceil(count / pageSize);
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );

  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5">
      <PageButton disabled={page === 1} onClick={() => onPage(page - 1)} aria-label="Previous">
        <ChevronLeft className="size-4" />
      </PageButton>
      {pages.map((p, i) => {
        const gap = i > 0 && p - pages[i - 1] > 1;
        return (
          <span key={p} className="flex items-center gap-1.5">
            {gap && <span className="px-1 text-muted">…</span>}
            <PageButton active={p === page} onClick={() => onPage(p)}>
              {p}
            </PageButton>
          </span>
        );
      })}
      <PageButton
        disabled={page === totalPages}
        onClick={() => onPage(page + 1)}
        aria-label="Next"
      >
        <ChevronRight className="size-4" />
      </PageButton>
    </nav>
  );
}

function PageButton({
  active,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={cn(
        "flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors",
        "disabled:opacity-40 disabled:pointer-events-none",
        active
          ? "bg-primary text-primary-foreground"
          : "border border-border text-foreground hover:bg-muted-bg",
      )}
      {...props}
    >
      {children}
    </button>
  );
}
