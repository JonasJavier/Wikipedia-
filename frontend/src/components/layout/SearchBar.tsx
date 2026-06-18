import { Search } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { cn } from "@/lib/utils";

interface Props {
  large?: boolean;
  autoFocus?: boolean;
  defaultValue?: string;
  className?: string;
  onSubmitted?: () => void;
}

export function SearchBar({
  large,
  autoFocus,
  defaultValue = "",
  className,
  onSubmitted,
}: Props) {
  const [value, setValue] = useState(defaultValue);
  const navigate = useNavigate();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const query = value.trim();
    if (!query) return;
    navigate(`/search?q=${encodeURIComponent(query)}`);
    onSubmitted?.();
  }

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)} role="search">
      <Search
        className={cn(
          "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted",
          large ? "size-5" : "size-4",
        )}
      />
      <input
        type="search"
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search the encyclopedia…"
        aria-label="Search articles"
        className={cn(
          "w-full rounded-full border border-border bg-card text-foreground placeholder:text-muted",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow",
          large ? "h-13 pl-12 pr-4 text-base shadow-[var(--shadow)]" : "h-10 pl-10 pr-4 text-sm",
        )}
      />
    </form>
  );
}
