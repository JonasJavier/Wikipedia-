import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { Logo } from "@/components/layout/Logo";

interface Props {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: Props) {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <div className="mb-8 flex justify-center">
        <Logo />
      </div>
      <div className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow)]">
        <h1 className="text-center font-serif text-2xl font-bold text-foreground">
          {title}
        </h1>
        <p className="mt-1 text-center text-sm text-muted">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
      <p className="mt-6 text-center text-sm text-muted">{footer}</p>
      <Link to="/" className="mt-2 text-center text-sm text-muted hover:text-foreground">
        ← Back to home
      </Link>
    </div>
  );
}
