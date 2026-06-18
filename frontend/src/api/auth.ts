import { useMutation, useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import { tokens } from "@/lib/tokens";
import type { AuthTokens, User } from "@/lib/types";
import { useAuthStore } from "@/store/auth";

interface LoginInput {
  username: string;
  password: string;
}

interface RegisterInput {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
}

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const { data } = await api.post<AuthTokens>("/auth/login/", input);
      return data;
    },
    onSuccess: (data) => setSession(data),
  });
}

export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      await api.post("/auth/register/", input);
      // Auto-login after a successful registration.
      const { data } = await api.post<AuthTokens>("/auth/login/", {
        username: input.username,
        password: input.password,
      });
      return data;
    },
    onSuccess: (data) => setSession(data),
  });
}

/** Hydrate / validate the current session against the backend. */
export function useMe() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);

  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        const { data } = await api.get<User>("/auth/me/");
        setUser(data);
        return data;
      } catch (error) {
        if (!tokens.refresh()) logout();
        throw error;
      }
    },
    enabled: isAuthenticated && Boolean(tokens.access()),
    retry: false,
    staleTime: 60 * 1000,
  });
}
