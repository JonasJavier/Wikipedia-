"""Shared pytest fixtures for the backend test suite."""

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from apps.articles.models import Article, Category

User = get_user_model()


@pytest.fixture(autouse=True)
def _isolated_cache(settings):
    """Use a throwaway in-memory cache so tests never touch the real Redis."""
    settings.CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "LOCATION": "test-cache",
        }
    }
    from django.core.cache import cache

    cache.clear()
    yield
    cache.clear()


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        username="tester", email="tester@example.com", password="testpass123"
    )


@pytest.fixture
def other_user(db):
    return User.objects.create_user(
        username="other", email="other@example.com", password="testpass123"
    )


@pytest.fixture
def auth_client(api_client, user) -> APIClient:
    api_client.force_authenticate(user=user)
    return api_client


@pytest.fixture
def category(db):
    return Category.objects.create(name="Programming", color="#10b981")


@pytest.fixture
def article(db, user, category):
    return Article.objects.create(
        title="Django",
        summary="A Python web framework.",
        content="# Django\n\nDjango is a high-level Python web framework.",
        category=category,
        author=user,
        last_editor=user,
    )
