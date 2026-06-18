from rest_framework import permissions
from rest_framework.request import Request
from rest_framework.views import APIView


class IsAuthorOrStaffOrReadOnly(permissions.BasePermission):
    """Read for anyone; deletion restricted to the original author or staff.

    Edits are intentionally open to any authenticated user (collaborative,
    wiki-style editing) — only destructive deletes are locked down.
    """

    def has_permission(self, request: Request, view: APIView) -> bool:
        # Reads are open; any write (create/update/delete) needs authentication.
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request: Request, view: APIView, obj) -> bool:
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.method == "DELETE":
            user = request.user
            return bool(user and (user.is_staff or obj.author_id == user.id))
        return bool(request.user and request.user.is_authenticated)
