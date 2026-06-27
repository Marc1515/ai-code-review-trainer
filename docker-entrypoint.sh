#!/bin/sh
set -e

attempt=1
max_attempts=30

until ./node_modules/.bin/prisma migrate deploy --schema=prisma/schema.prisma; do
  if [ "$attempt" -ge "$max_attempts" ]; then
    echo "Prisma migrations failed after $max_attempts attempts."
    exit 1
  fi

  echo "Database is not ready yet. Retrying migrations in 2 seconds... ($attempt/$max_attempts)"
  attempt=$((attempt + 1))
  sleep 2
done

exec node server.js
