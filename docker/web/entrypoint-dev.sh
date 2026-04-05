#!/bin/sh
set -eu

echo "Esperando base de datos para Pirate Studio dev..."
until npx prisma migrate deploy >/dev/null 2>&1; do
  sleep 2
done

echo "Sincronizando cliente Prisma..."
npx prisma generate >/dev/null 2>&1 || true

echo "Iniciando entorno de desarrollo con hot reload en http://localhost:3001"
exec npm run dev -- --hostname 0.0.0.0 --port 3000
