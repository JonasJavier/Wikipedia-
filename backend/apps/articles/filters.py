import django_filters

from .models import Article


class ArticleFilter(django_filters.FilterSet):
    """Filter articles by category slug or author username."""

    category = django_filters.CharFilter(field_name="category__slug")
    author = django_filters.CharFilter(field_name="author__username")

    class Meta:
        model = Article
        fields = ["category", "author"]
