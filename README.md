# Pirate Studio

Pirate Studio es una app web full stack pensada para oficios por encargo. Su centro no es llevar contabilidad fría, sino ayudarte a decidir con honestidad si un trabajo cabe o no cabe.

## Stack

- Next.js App Router
- TypeScript
- TailwindCSS
- Prisma ORM
- PostgreSQL
- Framer Motion
- Docker Compose con servicios separados

## Arquitectura Docker

La orquestación quedó separada por responsabilidad:

- `db`: PostgreSQL persistente
- `migrate`: aplica migraciones y seed
- `web`: app Next.js en modo producción
- `web-dev`: entorno de desarrollo con hot reload y código sincronizado por bind mount

Archivos principales:

- [docker-compose.yml](/home/freudiandev/Documentos/dev/Estudio%20Pirata/docker-compose.yml)
- [docker-compose.dev.yml](/home/freudiandev/Documentos/dev/Estudio%20Pirata/docker-compose.dev.yml)
- [docker/web/Dockerfile](/home/freudiandev/Documentos/dev/Estudio%20Pirata/docker/web/Dockerfile)

## Seguridad local

Se aplicaron medidas simples y útiles para local:

- `no-new-privileges`
- `cap_drop: ALL` en servicios de app
- publicación solo en `127.0.0.1`
- healthchecks
- `read_only` y `tmpfs` en `web`
- red dedicada para los servicios

## Persistencia de datos

Los datos no dependen de la imagen.

Volúmenes persistentes:

- `pirate_studio_postgres_data`: datos reales de PostgreSQL
- `pirate_studio_node_modules`: dependencias del entorno dev en contenedor
- `pirate_studio_next_cache`: caché `.next` para desarrollo

Mientras uses `docker compose down` o `podman-compose down`, los datos siguen ahí.

Solo se borran si haces algo como:

```bash
docker compose down -v
```

o eliminas manualmente el volumen.

## Producción local con Docker

```bash
docker compose up --build -d db migrate web
```

Abre `http://localhost:3000`

## Desarrollo sincronizado con Docker

Esto monta tu proyecto dentro del contenedor y deja hot reload:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build db migrate web-dev
```

También puedes usar el script:

```bash
npm run dev:docker
```

Ese entorno de desarrollo queda disponible en `http://localhost:3001`.

## Si tu entorno usa Podman

```bash
podman-compose up --build -d
```

Para desarrollo:

```bash
podman-compose -f docker-compose.yml -f docker-compose.dev.yml up --build db migrate web-dev
```

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
