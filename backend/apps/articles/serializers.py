from rest_framework import serializers

from .models import Article, Category, Revision


class AuthorSerializer(serializers.Serializer):
    """Lightweight author representation embedded in article payloads."""

    id = serializers.IntegerField(read_only=True)
    username = serializers.CharField(read_only=True)
    avatar = serializers.ImageField(read_only=True)


class CategorySerializer(serializers.ModelSerializer):
    article_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = ("id", "name", "slug", "description", "color", "article_count")
        read_only_fields = ("id", "slug", "article_count")


class ArticleListSerializer(serializers.ModelSerializer):
    """Compact representation for lists, search and cards."""

    category = CategorySerializer(read_only=True)
    author = AuthorSerializer(read_only=True)
    read_time = serializers.IntegerField(read_only=True)

    class Meta:
        model = Article
        fields = (
            "id",
            "title",
            "slug",
            "summary",
            "category",
            "author",
            "view_count",
            "read_time",
            "created_at",
            "updated_at",
        )


class ArticleDetailSerializer(ArticleListSerializer):
    """Full representation including the Markdown body."""

    last_editor = AuthorSerializer(read_only=True)
    revision_count = serializers.IntegerField(read_only=True)

    class Meta(ArticleListSerializer.Meta):
        fields = ArticleListSerializer.Meta.fields + (
            "content",
            "last_editor",
            "is_published",
            "revision_count",
        )


class ArticleWriteSerializer(serializers.ModelSerializer):
    """Used for create/update; accepts a category slug and an edit comment."""

    category = serializers.SlugRelatedField(
        slug_field="slug",
        queryset=Category.objects.all(),
        required=False,
        allow_null=True,
    )
    comment = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        max_length=255,
        help_text="Optional edit summary stored with the revision.",
    )

    class Meta:
        model = Article
        fields = (
            "id",
            "title",
            "slug",
            "summary",
            "content",
            "category",
            "is_published",
            "comment",
        )
        read_only_fields = ("id", "slug")

    def validate_title(self, value: str) -> str:
        value = value.strip()
        if len(value) < 3:
            raise serializers.ValidationError("Title must be at least 3 characters.")
        return value

    def create(self, validated_data: dict) -> Article:
        # `comment` is a write-only convenience field consumed by the view to
        # build the revision; it is not a model field.
        validated_data.pop("comment", None)
        return super().create(validated_data)

    def update(self, instance: Article, validated_data: dict) -> Article:
        validated_data.pop("comment", None)
        return super().update(instance, validated_data)


class RevisionSerializer(serializers.ModelSerializer):
    editor = AuthorSerializer(read_only=True)

    class Meta:
        model = Revision
        fields = ("id", "editor", "comment", "created_at")


class RevisionDetailSerializer(RevisionSerializer):
    class Meta(RevisionSerializer.Meta):
        fields = RevisionSerializer.Meta.fields + ("title", "summary", "content")


class SiteStatsSerializer(serializers.Serializer):
    """Aggregate counts shown on the home page."""

    articles = serializers.IntegerField()
    categories = serializers.IntegerField()
    contributors = serializers.IntegerField()
    total_views = serializers.IntegerField()
