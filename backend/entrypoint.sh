#!/usr/bin/env sh
set -e

echo "⏳ Waiting for PostgreSQL to accept connections..."
until python - <<'PY' 2>/dev/null
import os
from urllib.parse import urlparse

import psycopg

url = urlparse(os.environ["DATABASE_URL"])
psycopg.connect(
    host=url.hostname,
    port=url.port or 5432,
    user=url.username,
    password=url.password,
    dbname=url.path.lstrip("/"),
).close()
PY
do
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

exec "$@"
