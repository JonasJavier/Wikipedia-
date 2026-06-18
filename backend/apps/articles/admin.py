from django.contrib import admin

from .models import Article, Category, Revision


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "color")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name",)


class RevisionInline(admin.TabularInline):
    model = Revision
    extra = 0
    readonly_fields = ("editor", "title", "comment", "created_at")
    can_delete = False
    fields = ("created_at", "editor", "title", "comment")
    ordering = ("-created_at",)


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "category",
        "author",
        "is_published",
        "view_count",
        "updated_at",
    )
    list_filter = ("is_published", "category", "created_at")
    search_fields = ("title", "summary", "content")
    prepopulated_fields = {"slug": ("title",)}
    autocomplete_fields = ("category", "author", "last_editor")
    readonly_fields = ("view_count", "created_at", "updated_at")
    inlines = [RevisionInline]
    date_hierarchy = "created_at"


@admin.register(Revision)
class RevisionAdmin(admin.ModelAdmin):
    list_display = ("article", "editor", "comment", "created_at")
    list_filter = ("created_at",)
    search_fields = ("article__title", "comment")
    readonly_fields = ("article", "editor", "title", "summary", "content", "created_at")
