import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { extractHeadings } from "./markdownUtils";

export function TableOfContents({ content }: { content: string }) {
  const headings = extractHeadings(content);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
    );
    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  if (headings.length < 2) return null;

  return (
    <nav className="text-sm">
      <p className="mb-3 font-semibold text-foreground">On this page</p>
      <ul className="space-y-1.5 border-l border-border">
        {headings.map((h) => (
          <li key={h.id} className={cn(h.level === 3 && "ml-3")}>
            <a
              href={`#${h.id}`}
              className={cn(
                "-ml-px block border-l-2 py-0.5 pl-3 transition-colors",
                active === h.id
                  ? "border-primary font-medium text-primary"
                  : "border-transparent text-muted hover:text-foreground",
              )}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
