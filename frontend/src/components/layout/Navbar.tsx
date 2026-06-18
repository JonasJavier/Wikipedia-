import { Menu, Shuffle, X } from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { fetchRandomArticle } from "@/api/articles";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { SearchBar } from "./SearchBar";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

const links = [
  { to: "/browse", label: "Browse" },
  { to: "/categories", label: "Categories" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  async function goRandom() {
    try {
      const article = await fetchRandomArticle();
      navigate(`/wiki/${article.slug}`);
    } catch {
      navigate("/browse");
    }
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLinkItem key={link.to} to={link.to}>
              {link.label}
            </NavLinkItem>
          ))}
          <button
            onClick={goRandom}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-muted-bg hover:text-foreground"
          >
            <Shuffle className="size-4" />
            Random
          </button>
        </nav>

        <div className="ml-auto hidden max-w-xs flex-1 lg:block">
          <SearchBar />
        </div>

        <div className="ml-auto flex items-center gap-1 lg:ml-2">
          <ThemeToggle />
          <div className="hidden sm:block">
            <UserMenu />
          </div>
          <button
            className="rounded-lg p-2 text-foreground hover:bg-muted-bg md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <SearchBar onSubmitted={() => setMobileOpen(false)} />
          <nav className="mt-3 flex flex-col gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted-bg"
              >
                {link.label}
              </NavLink>
            ))}
            <button
              onClick={goRandom}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-foreground hover:bg-muted-bg"
            >
              <Shuffle className="size-4" />
              Random article
            </button>
          </nav>
          <div className="mt-3 border-t border-border pt-3 sm:hidden">
            <UserMenu />
          </div>
        </div>
      )}
    </header>
  );
}

function NavLinkItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-muted-bg text-foreground"
            : "text-muted hover:bg-muted-bg hover:text-foreground",
        )
      }
    >
      {children}
    </NavLink>
  );
}
