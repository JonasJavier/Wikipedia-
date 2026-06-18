import { Link } from "react-router-dom";

import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-sm text-sm text-muted">
            A modern, open encyclopedia. Built as a portfolio project with Django,
            DRF, PostgreSQL, Redis, React, Vite &amp; TypeScript.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <Link to="/browse" className="text-muted hover:text-foreground">
            Browse
          </Link>
          <Link to="/categories" className="text-muted hover:text-foreground">
            Categories
          </Link>
          <Link to="/new" className="text-muted hover:text-foreground">
            Write
          </Link>
          <a
            href="http://localhost:8000/api/docs/"
            target="_blank"
            rel="noreferrer"
            className="text-muted hover:text-foreground"
          >
            API docs
          </a>
        </nav>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} Wikiverse. Free knowledge for everyone.
      </div>
    </footer>
  );
}
