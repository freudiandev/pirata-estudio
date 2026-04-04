#!/bin/sh
set -eu

echo "Esperando base de datos para Pirate Studio web..."
until npx prisma migrate deploy >/dev/null 2>&1; do
  sleep 2
done

echo "Iniciando interfaz web en http://localhost:3000"
exec npm run start
