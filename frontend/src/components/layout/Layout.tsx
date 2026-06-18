import { useEffect } from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";

import { useMe } from "@/api/auth";
import { applyTheme, useThemeStore } from "@/store/theme";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

export function Layout() {
  const theme = useThemeStore((s) => s.theme);
  useEffect(() => applyTheme(theme), [theme]);
  // Validate / hydrate the persisted session against the backend.
  useMe();

  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  );
}
