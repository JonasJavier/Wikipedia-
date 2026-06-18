"""Operational endpoints (health checks, etc.)."""

from django.db import connection
from drf_spectacular.utils import extend_schema
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response


@extend_schema(
    summary="Health check",
    description="Liveness/readiness probe. Returns 200 when the database is reachable.",
    responses={200: dict, 503: dict},
    tags=["ops"],
)
@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request: Request) -> Response:
    """Verify the service and its database are responsive."""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except Exception:  # noqa: BLE001 - report any DB failure as unhealthy
        return Response({"status": "unhealthy", "database": "down"}, status=503)
    return Response({"status": "ok", "database": "up"})
