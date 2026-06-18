export interface User {
  id: number;
  username: string;
  email: string;
  bio: string;
  avatar: string | null;
  article_count: number;
  date_joined: string;
}

export interface Author {
  id: number;
  username: string;
  avatar: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
  article_count: number;
}

export interface ArticleListItem {
  id: number;
  title: string;
  slug: string;
  summary: string;
  category: Category | null;
  author: Author | null;
  view_count: number;
  read_time: number;
  created_at: string;
  updated_at: string;
}

export interface Article extends ArticleListItem {
  content: string;
  last_editor: Author | null;
  is_published: boolean;
  revision_count: number;
}

export interface Revision {
  id: number;
  editor: Author | null;
  comment: string;
  created_at: string;
}

export interface RevisionDetail extends Revision {
  title: string;
  summary: string;
  content: string;
}

export interface SiteStats {
  articles: number;
  categories: number;
  contributors: number;
  total_views: number;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AuthTokens {
  access: string;
  refresh: string;
  user: User;
}

export interface ArticleInput {
  title: string;
  summary: string;
  content: string;
  category: string | null;
  is_published: boolean;
  comment?: string;
}
