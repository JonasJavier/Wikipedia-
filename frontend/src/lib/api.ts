import axios, {
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

import { useAuthStore } from "@/store/auth";
import { tokens } from "./tokens";

const rawBaseURL = import.meta.env.VITE_API_URL;

const baseURL = (rawBaseURL?.trim() || "http://localhost:8000/api").replace(
  /\/+$/,
  "",
);

export const api = axios.create({
  baseURL,
});

// Attach the access token to every request.
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const access = tokens.access();

  if (access) {
    config.headers.Authorization = `Bearer ${access}`;
  }

  return config;
});

// Single-flight refresh: queue requests while a refresh is in progress.
let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = tokens.refresh();

  if (!refresh) return null;

  try {
    const { data } = await axios.post<{ access: string }>(
      `${baseURL}/auth/refresh/`,
      { refresh },
    );

    tokens.setAccess(data.access);
    return data.access;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const original = error.config as
      | (AxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const isAuthError = error.response?.status === 401;
    const isRefreshCall = original?.url?.includes("/auth/refresh/");

    if (isAuthError && original && !original._retry && !isRefreshCall) {
      original._retry = true;

      refreshing ??= refreshAccessToken().finally(() => {
        refreshing = null;
      });

      const newAccess = await refreshing;

      if (newAccess) {
        original.headers = original.headers ?? {};
        (original.headers as Record<string, string>).Authorization =
          `Bearer ${newAccess}`;

        return api(original);
      }

      // Refresh failed — log out.
      useAuthStore.getState().logout();
    }

    return Promise.reject(error);
  },
);

/** Normalize a DRF error response into a readable message. */
export function apiErrorMessage(
  error: unknown,
  fallback = "Something went wrong.",
): string {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as Record<string, unknown>;

    if (typeof data.detail === "string") return data.detail;

    const first = Object.values(data)[0];

    if (Array.isArray(first) && typeof first[0] === "string") {
      return first[0];
    }

    if (typeof first === "string") return first;
  }

  return fallback;
}