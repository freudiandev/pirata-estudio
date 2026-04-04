#!/bin/sh
set -eu

echo "Aplicando migraciones..."
npx prisma migrate deploy

echo "Sembrando datos iniciales si hace falta..."
npm run db:seed || true

echo "Migracion y seed terminadas."
