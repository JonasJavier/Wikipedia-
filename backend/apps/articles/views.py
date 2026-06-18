from __future__ import annotations

from django.contrib.postgres.search import SearchQuery, SearchRank, SearchVector
from django.core.cache import cache
from django.db import connection
from django.db.models import Count, F, Q, Sum
from drf_spectacular.utils import extend_schema
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .filters import ArticleFilter
from .models import Article, Category, Revision
from .permissions import IsAuthorOrStaffOrReadOnly
from .serializers import (
    ArticleDetailSerializer,
    ArticleListSerializer,
    ArticleWriteSerializer,
    CategorySerializer,
    RevisionDetailSerializer,
    RevisionSerializer,
    SiteStatsSerializer,
)

STATS_CACHE_KEY = "site_stats"
STATS_CACHE_TTL = 60 * 5


@extend_schema(tags=["categories"])
class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Browse article categories."""

    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "slug"
    pagination_class = None

    def get_queryset(self):
        return Category.objects.annotate(
            article_count=Count("articles", filter=Q(articles__is_published=True))
        )


@extend_schema(tags=["articles"])
class ArticleViewSet(viewsets.ModelViewSet):
    """Full CRUD for encyclopedia articles, plus search, history and stats."""

    permission_classes = [IsAuthorOrStaffOrReadOnly]
    lookup_field = "slug"
    filterset_class = ArticleFilter
    ordering_fields = ["updated_at", "created_at", "view_count", "title"]
    ordering = ["-updated_at"]

    # ----- queryset ----------------------------------------------------- #
    def get_queryset(self):
        qs = Article.objects.select_related("category", "author", "last_editor")

        if self.action == "list":
            qs = self._visible(qs)
            qs = self._apply_search(qs)
        elif self.action in {"retrieve", "update", "partial_update", "destroy", "revisions"}:
            qs = self._visible(qs)
        return qs

    def _visible(self, qs):
        """Published articles, plus the requester's own drafts."""
        user = self.request.user
        if user.is_authenticated:
            return qs.filter(Q(is_published=True) | Q(author=user))
        return qs.filter(is_published=True)

    def _apply_search(self, qs):
        term = self.request.query_params.get("search", "").strip()
        if not term:
            return qs
        if connection.vendor == "postgresql":
            vector = (
                SearchVector("title", weight="A")
                + SearchVector("summary", weight="B")
                + SearchVector("content", weight="C")
            )
            query = SearchQuery(term)
            return (
                qs.annotate(rank=SearchRank(vector, query))
                .filter(rank__gt=0)
                .order_by("-rank", "-updated_at")
            )
        return qs.filter(Q(title__icontains=term) | Q(summary__icontains=term))

    # ----- serializers -------------------------------------------------- #
    def get_serializer_class(self):
        if self.action == "list":
            return ArticleListSerializer
        if self.action in {"create", "update", "partial_update"}:
            return ArticleWriteSerializer
        return ArticleDetailSerializer

    # ----- write hooks (record revisions) ------------------------------- #
    def perform_create(self, serializer):
        article = serializer.save(author=self.request.user, last_editor=self.request.user)
        self._snapshot(article, default="Created the article")
        cache.delete(STATS_CACHE_KEY)

    def perform_update(self, serializer):
        article = serializer.save(last_editor=self.request.user)
        self._snapshot(article, default="Edited the article")

    def perform_destroy(self, instance):
        instance.delete()
        cache.delete(STATS_CACHE_KEY)

    def _snapshot(self, article: Article, default: str) -> None:
        Revision.objects.create(
            article=article,
            editor=self.request.user,
            title=article.title,
            summary=article.summary,
            content=article.content,
            comment=self.request.data.get("comment") or default,
        )

    # ----- retrieve (count a view) -------------------------------------- #
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        Article.objects.filter(pk=instance.pk).update(view_count=F("view_count") + 1)
        instance.view_count += 1
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    # ----- extra read endpoints ----------------------------------------- #
    @extend_schema(responses=ArticleDetailSerializer)
    @action(detail=False, methods=["get"])
    def random(self, request):
        """Return a single random published article."""
        article = self._visible(self.get_queryset_base()).order_by("?").first()
        if article is None:
            return Response({"detail": "No articles yet."}, status=404)
        return Response(
            ArticleDetailSerializer(article, context=self.get_serializer_context()).data
        )

    @action(detail=False, methods=["get"])
    def popular(self, request):
        """Most-viewed published articles."""
        qs = self._visible(self.get_queryset_base()).order_by("-view_count")[:10]
        return Response(
            ArticleListSerializer(qs, many=True, context=self.get_serializer_context()).data
        )

    @action(detail=True, methods=["get"])
    def revisions(self, request, slug=None):
        """Edit history for an article."""
        article = self.get_object()
        qs = article.revisions.select_related("editor")
        page = self.paginate_queryset(qs)
        serializer = RevisionSerializer(page, many=True, context=self.get_serializer_context())
        return self.get_paginated_response(serializer.data)

    @extend_schema(responses=RevisionDetailSerializer)
    @action(detail=True, methods=["get"], url_path="revisions/(?P<revision_id>[0-9]+)")
    def revision_detail(self, request, slug=None, revision_id=None):
        """Full snapshot of a single revision (for diffs)."""
        article = self.get_object()
        revision = article.revisions.select_related("editor").get(pk=revision_id)
        return Response(
            RevisionDetailSerializer(revision, context=self.get_serializer_context()).data
        )

    @extend_schema(responses=SiteStatsSerializer)
    @action(detail=False, methods=["get"], permission_classes=[permissions.AllowAny])
    def stats(self, request):
        """Aggregate site stats for the home page (cached in Redis)."""
        data = cache.get(STATS_CACHE_KEY)
        if data is None:
            published = Article.objects.filter(is_published=True)
            data = {
                "articles": published.count(),
                "categories": Category.objects.count(),
                "contributors": published.values("author").distinct().count(),
                "total_views": published.aggregate(t=Sum("view_count"))["t"] or 0,
            }
            cache.set(STATS_CACHE_KEY, data, STATS_CACHE_TTL)
        return Response(SiteStatsSerializer(data).data)

    def get_queryset_base(self):
        return Article.objects.select_related("category", "author", "last_editor")
