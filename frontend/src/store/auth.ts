import { create } from "zustand";
import { persist } from "zustand/middleware";

import { tokens } from "@/lib/tokens";
import type { AuthTokens, User } from "@/lib/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setSession: (data: AuthTokens) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setSession: (data) => {
        tokens.set(data.access, data.refresh);
        set({ user: data.user, isAuthenticated: true });
      },
      setUser: (user) => set({ user }),
      logout: () => {
        tokens.clear();
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "wikiverse.auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
