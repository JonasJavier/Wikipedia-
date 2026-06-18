import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Category } from "@/lib/types";

export const categoryKeys = {
  all: ["categories"] as const,
  detail: (slug: string) => ["categories", slug] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: async () => {
      const { data } = await api.get<Category[]>("/categories/");
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: categoryKeys.detail(slug),
    queryFn: async () => {
      const { data } = await api.get<Category>(`/categories/${slug}/`);
      return data;
    },
    enabled: Boolean(slug),
  });
}
