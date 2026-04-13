#!/bin/sh
set -eu

mkdir -p /app/data

if [ -z "${DATABASE_URL:-}" ]; then
  export DATABASE_URL="file:/app/data/dev.db"
fi

npx prisma migrate deploy
exec npm run start
