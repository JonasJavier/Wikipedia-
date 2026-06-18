import { Eye, Loader2, Pencil, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  useArticle,
  useCreateArticle,
  useUpdateArticle,
} from "@/api/articles";
import { useCategories } from "@/api/categories";
import { Markdown } from "@/components/article/Markdown";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Field";
import { apiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";

const CONTAINER = "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10";

export function EditorPage() {
  const { slug } = useParams();
  const isEdit = Boolean(slug);
  const navigate = useNavigate();

  const { data: existing } = useArticle(slug ?? "");
  const { data: categories } = useCategories();
  const create = useCreateArticle();
  const update = useUpdateArticle(slug ?? "");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [comment, setComment] = useState("");
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit && existing) {
      setTitle(existing.title);
      setCategory(existing.category?.slug ?? "");
      setSummary(existing.summary);
      setContent(existing.content);
    }
  }, [isEdit, existing]);

  const pending = create.isPending || update.isPending;

  async function handleSubmit() {
    setError("");
    if (title.trim().length < 3) return setError("Title must be at least 3 characters.");
    if (content.trim().length === 0) return setError("Content can't be empty.");

    const payload = {
      title: title.trim(),
      summary: summary.trim(),
      content,
      category: category || null,
      is_published: true,
      comment: comment.trim(),
    };

    try {
      const article = isEdit
        ? await update.mutateAsync(payload)
        : await create.mutateAsync(payload);
      navigate(`/wiki/${article.slug}`);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not save the article."));
    }
  }

  return (
    <div className={CONTAINER}>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-foreground">
          {isEdit ? "Edit article" : "New article"}
        </h1>
        <Button onClick={handleSubmit} disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {isEdit ? "Save changes" : "Publish"}
        </Button>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <div className="space-y-5">
        {/* Title & category */}
        <div className="grid gap-4 sm:grid-cols-[1fr_14rem]">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Quantum computing"
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-[42px] w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">No category</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="summary">Summary</Label>
          <Input
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="A short description shown in cards and search results."
            maxLength={300}
          />
        </div>

        {/* Content with live preview */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label className="mb-0">Content (Markdown)</Label>
            <div className="flex rounded-lg border border-border p-0.5 lg:hidden">
              <TabButton active={tab === "write"} onClick={() => setTab("write")} icon={Pencil}>
                Write
              </TabButton>
              <TabButton active={tab === "preview"} onClick={() => setTab("preview")} icon={Eye}>
                Preview
              </TabButton>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={"# Heading\n\nWrite your article using **Markdown**…"}
              className={cn("min-h-[28rem] font-mono text-sm", tab === "preview" && "hidden lg:block")}
            />
            <div
              className={cn(
                "min-h-[28rem] overflow-auto rounded-lg border border-border bg-card p-5",
                tab === "write" && "hidden lg:block",
              )}
            >
              {content.trim() ? (
                <Markdown content={content} />
              ) : (
                <p className="text-sm text-muted">Preview will appear here.</p>
              )}
            </div>
          </div>
        </div>

        {isEdit && (
          <div>
            <Label htmlFor="comment">Edit summary (optional)</Label>
            <Input
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Briefly describe what you changed."
            />
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Pencil;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-3 py-1 text-sm font-medium transition-colors",
        active ? "bg-muted-bg text-foreground" : "text-muted",
      )}
    >
      <Icon className="size-3.5" />
      {children}
    </button>
  );
}
