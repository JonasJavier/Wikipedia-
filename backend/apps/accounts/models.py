from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user with a public profile.

    Kept username-based for simplicity, but ``email`` is required and unique so
    it can be used for account recovery and notifications.
    """

    email = models.EmailField("email address", unique=True)
    bio = models.TextField(blank=True, max_length=500)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)

    class Meta:
        ordering = ["username"]

    def __str__(self) -> str:
        return self.username

    @property
    def article_count(self) -> int:
        return self.articles.count()
