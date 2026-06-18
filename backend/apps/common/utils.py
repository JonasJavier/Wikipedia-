"""Small shared helpers."""

from __future__ import annotations

from django.db import models
from django.utils.text import slugify


def unique_slugify(
    instance: models.Model,
    value: str,
    slug_field_name: str = "slug",
    max_length: int = 220,
) -> str:
    """Set a unique slug on ``instance`` derived from ``value``.

    Appends ``-1``, ``-2``… until the slug is unique for the model, ignoring
    the instance's own row so re-saving an object keeps its slug stable.
    """
    base = slugify(value)[:max_length] or "untitled"
    model = instance.__class__
    manager = model._default_manager
    slug = base
    counter = 1
    while manager.filter(**{slug_field_name: slug}).exclude(pk=instance.pk).exists():
        suffix = f"-{counter}"
        slug = f"{base[: max_length - len(suffix)]}{suffix}"
        counter += 1
    setattr(instance, slug_field_name, slug)
    return slug
