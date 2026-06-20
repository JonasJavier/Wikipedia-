#!/usr/bin/env sh
set -e

echo "⏳ Waiting for PostgreSQL to accept connections..."
until python - <<'PY'
import os
from urllib.parse import urlparse

import psycopg

database_url = os.environ.get("DATABASE_URL", "")
print(f"DATABASE_URL starts with: {database_url[:25]}...")

url = urlparse(database_url)
print(f"Parsed DB host={url.hostname}, port={url.port or 5432}, db={url.path.lstrip('/')}")

psycopg.connect(
    host=url.hostname,
    port=url.port or 5432,
    user=url.username,
    password=url.password,
    dbname=url.path.lstrip("/"),
).close()
PY
do
  echo "PostgreSQL is not ready yet. Retrying..."
  sleep 1
done
echo "✅ Database is ready."

echo "▶️  Applying migrations..."
python manage.py migrate --noinput

if [ "${DJANGO_COLLECTSTATIC:-true}" = "true" ]; then
  echo "▶️  Collecting static files..."
  python manage.py collectstatic --noinput
fi

if [ "${DJANGO_SEED:-false}" = "true" ]; then
  echo "▶️  Seeding demo data..."
  python manage.py seed
fi

echo "🚀 Starting application on PORT=${PORT:-8000}..."
exec "$@"