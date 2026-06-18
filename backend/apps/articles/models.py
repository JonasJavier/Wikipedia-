from __future__ import annotations

import math

from django.conf import settings
from django.db import models
from django.utils import timezone

from apps.common.utils import unique_slugify


class Category(models.Model):
    """A topic grouping for articles (e.g. Programming, Science)."""

    name = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=90, unique=True, blank=True)
    description = models.CharField(max_length=255, blank=True)
    color = models.CharField(
        max_length=7,
        default="#3b82f6",
        help_text="Hex color used for the category chip in the UI.",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "categories"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs) -> None:
        if not self.slug:
            unique_slugify(self, self.name, max_length=90)
        super().save(*args, **kwargs)


class Article(models.Model):
    """An encyclopedia article written in Markdown."""

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True, db_index=True)
    summary = models.CharField(
        max_length=300,
        blank=True,
        help_text="Short description shown in cards and search results.",
    )
    content = models.TextField(help_text="Article body in Markdown.")
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="articles",
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="articles",
    )
    last_editor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="edited_articles",
    )
    is_published = models.BooleanField(default=True)
    view_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        indexes = [
            models.Index(fields=["-updated_at"]),
            models.Index(fields=["-view_count"]),
            models.Index(fields=["is_published"]),
        ]

    def __str__(self) -> str:
        return self.title

    def save(self, *args, **kwargs) -> None:
        if not self.slug:
            unique_slugify(self, self.title, max_length=220)
        super().save(*args, **kwargs)

    @property
    def read_time(self) -> int:
        """Estimated reading time in minutes (~200 wpm)."""
        words = len(self.content.split())
        return max(1, math.ceil(words / 200))

    @property
    def revision_count(self) -> int:
        return self.revisions.count()


class Revision(models.Model):
    """An immutable snapshot of an article at a point in time.

    A new revision is recorded every time an article is created or edited,
    giving the encyclopedia a full, browsable edit history.
    """

    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name="revisions")
    editor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="revisions",
    )
    title = models.CharField(max_length=200)
    summary = models.CharField(max_length=300, blank=True)
    content = models.TextField()
    comment = models.CharField(
        max_length=255,
        blank=True,
        help_text="Edit summary describing what changed.",
    )
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["article", "-created_at"])]

    def __str__(self) -> str:
        return f"{self.article.title} @ {self.created_at:%Y-%m-%d %H:%M}"
