# Pirate Studio

Pirate Studio es una app web full stack pensada para oficios por encargo. Su centro no es llevar contabilidad fría, sino ayudarte a decidir con honestidad si un trabajo cabe o no cabe.

## Stack

- Next.js App Router
- TypeScript
- TailwindCSS
- Prisma ORM
- PostgreSQL
- Framer Motion
- Docker + docker compose

## Levantar con Docker

1. Usa el `.env` incluido o copia `.env.example` si quieres cambiar credenciales.
2. Ejecuta:

```bash
docker compose up --build -d
```

3. Abre `http://localhost:3000`

Si en tu máquina `docker compose` usa Podman, puedes usar esto:

```bash
podman-compose up --build -d
```

La persistencia de PostgreSQL queda en el volumen `pirate_studio_postgres_data`.
La arquitectura Docker quedó separada por responsabilidad:

- `db`: PostgreSQL persistente
- `migrate`: aplica migraciones y seed
- `web`: sirve la aplicación Next.js

Todos comparten una red dedicada `pirate-studio-network`.

## Levantar sin Docker

1. Levanta solo PostgreSQL:

```bash
docker compose up -d db
```

2. Genera cliente, migra y siembra:

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
```

3. Arranca la app:

```bash
npm run dev
```

## Rutas principales

- `/` Hoy
- `/jobs` Promesas pendientes
- `/jobs/new` Nuevo trabajo
- `/goals` Objetivos
- `/settings` Ajustes
- `/welcome` Onboarding inicial

## Idea central del producto

Pirate Studio calcula tu capacidad real:

- mira tus horas laborables reales
- suma lo pendiente
- reparte la carga en los días disponibles
- compara contra la fecha prometida
- te dice si aceptar algo nuevo es sensato o no

Si no actualizas tus pendientes, la app te frena primero. La lógica está hecha para ayudarte a no autoengañarte.
