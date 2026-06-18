import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { api } from "@/lib/api";
import type {
  Article,
  ArticleInput,
  ArticleListItem,
  Paginated,
  Revision,
  RevisionDetail,
  SiteStats,
} from "@/lib/types";

export interface ArticleQuery {
  search?: string;
  category?: string;
  author?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export const articleKeys = {
  all: ["articles"] as const,
  list: (params: ArticleQuery) => ["articles", "list", params] as const,
  detail: (slug: string) => ["articles", "detail", slug] as const,
  revisions: (slug: string) => ["articles", slug, "revisions"] as const,
  revision: (slug: string, id: number) =>
    ["articles", slug, "revisions", id] as const,
  popular: ["articles", "popular"] as const,
  stats: ["articles", "stats"] as const,
};

export function useArticles(params: ArticleQuery = {}) {
  return useQuery({
    queryKey: articleKeys.list(params),
    queryFn: async () => {
      const { data } = await api.get<Paginated<ArticleListItem>>("/articles/", {
        params,
      });
      return data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useArticle(slug: string) {
  return useQuery({
    queryKey: articleKeys.detail(slug),
    queryFn: async () => {
      const { data } = await api.get<Article>(`/articles/${slug}/`);
      return data;
    },
    enabled: Boolean(slug),
  });
}

export function usePopularArticles() {
  return useQuery({
    queryKey: articleKeys.popular,
    queryFn: async () => {
      const { data } = await api.get<ArticleListItem[]>("/articles/popular/");
      return data;
    },
  });
}

export function useSiteStats() {
  return useQuery({
    queryKey: articleKeys.stats,
    queryFn: async () => {
      const { data } = await api.get<SiteStats>("/articles/stats/");
      return data;
    },
  });
}

export function useArticleRevisions(slug: string) {
  return useQuery({
    queryKey: articleKeys.revisions(slug),
    queryFn: async () => {
      const { data } = await api.get<Paginated<Revision>>(
        `/articles/${slug}/revisions/`,
      );
      return data;
    },
    enabled: Boolean(slug),
  });
}

export function useRevisionDetail(slug: string, id: number | null) {
  return useQuery({
    queryKey: articleKeys.revision(slug, id ?? 0),
    queryFn: async () => {
      const { data } = await api.get<RevisionDetail>(
        `/articles/${slug}/revisions/${id}/`,
      );
      return data;
    },
    enabled: Boolean(slug) && id !== null,
  });
}

export async function fetchRandomArticle(): Promise<Article> {
  const { data } = await api.get<Article>("/articles/random/");
  return data;
}

export function useCreateArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ArticleInput) => {
      const { data } = await api.post<Article>("/articles/", input);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: articleKeys.all });
    },
  });
}

export function useUpdateArticle(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<ArticleInput>) => {
      const { data } = await api.patch<Article>(`/articles/${slug}/`, input);
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: articleKeys.all });
      qc.setQueryData(articleKeys.detail(data.slug), data);
    },
  });
}

export function useDeleteArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (slug: string) => {
      await api.delete(`/articles/${slug}/`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: articleKeys.all });
    },
  });
}
