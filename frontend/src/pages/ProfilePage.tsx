import { useQuery } from "@tanstack/react-query";
import { CalendarDays, UserX } from "lucide-react";
import { useParams } from "react-router-dom";

import { useArticles } from "@/api/articles";
import { ArticleGrid } from "@/components/article/ArticleGrid";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const CONTAINER = "mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12";

export function ProfilePage() {
  const { username = "" } = useParams();

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ["profile", username],
    queryFn: async () => {
      const { data } = await api.get<User>(`/auth/users/${username}/`);
      return data;
    },
    enabled: Boolean(username),
  });

  const { data: articles, isLoading: loadingArticles } = useArticles({
    author: username,
    page_size: 12,
  });

  if (isError) {
    return (
      <div className={CONTAINER}>
        <EmptyState
          icon={UserX}
          title="User not found"
          description={`No account exists for “${username}”.`}
        />
      </div>
    );
  }

  return (
    <div className={CONTAINER}>
      <header className="mb-10 flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        {isLoading || !profile ? (
          <Skeleton className="size-20 rounded-full" />
        ) : (
          <Avatar name={profile.username} src={profile.avatar} className="size-20 text-2xl" />
        )}
        <div className="flex-1">
          {isLoading || !profile ? (
            <Skeleton className="mx-auto h-8 w-40 sm:mx-0" />
          ) : (
            <>
              <h1 className="font-serif text-3xl font-bold text-foreground">
                {profile.username}
              </h1>
              {profile.bio && <p className="mt-1 text-muted">{profile.bio}</p>}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm text-muted sm:justify-start">
                <span>
                  <span className="font-semibold text-foreground">
                    {profile.article_count}
                  </span>{" "}
                  articles
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="size-4" />
                  Joined {formatDate(profile.date_joined)}
                </span>
              </div>
            </>
          )}
        </div>
      </header>

      <h2 className="mb-5 font-serif text-xl font-bold text-foreground">
        Articles by {profile?.username ?? username}
      </h2>
      <ArticleGrid
        articles={articles?.results}
        isLoading={loadingArticles}
        emptyTitle="No articles yet"
        emptyDescription="This user hasn't published anything."
      />
    </div>
  );
}
