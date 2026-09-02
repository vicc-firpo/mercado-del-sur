# Mercado del Sur — Backend

E-commerce API built with [NestJS](https://nestjs.com/), [TypeORM](https://typeorm.io/)
and PostgreSQL.

## Requirements

- Node.js 20+
- Docker + Docker Compose (for the database)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your local env file
cp .env.example .env

# 3. Start PostgreSQL
docker compose up -d db

# 4. Run database migrations
npm run migration:run

# 5. Start the API (watch mode)
npm run start:dev
```

The API listens on `http://localhost:3000` by default (`PORT` in `.env`).

## Environment variables

| Variable      | Description                     | Default (`.env.example`) |
| ------------- | ------------------------------- | ------------------------ |
| `PORT`        | HTTP port for the API           | `3000`                   |
| `DB_HOST`     | PostgreSQL host                 | `localhost`              |
| `DB_PORT`     | PostgreSQL port (host side)     | `5432`                   |
| `DB_USER`     | PostgreSQL user                 | `mercado_del_sur`        |
| `DB_PASSWORD` | PostgreSQL password             | `mercado_del_sur`        |
| `DB_NAME`     | PostgreSQL database name        | `mercado_del_sur`        |

`docker-compose.yml` reads the same `.env` file, so the database credentials and the
API configuration always stay in sync.

## Database migrations

Schema changes are applied exclusively through TypeORM migrations
(`synchronize` is disabled). Migration files live in `src/database/migrations`.

```bash
# Generate a migration from entity changes
npm run migration:generate -- src/database/migrations/<MigrationName>

# Apply pending migrations
npm run migration:run

# Revert the last migration
npm run migration:revert
```

## API — Users

| Method   | Path         | Description                     | Success |
| -------- | ------------ | ------------------------------- | ------- |
| `POST`   | `/users`     | Create a user                   | `201`   |
| `GET`    | `/users`     | List all users (`UserDto[]`)    | `200`   |
| `GET`    | `/users/:id` | Get a single user (`UserDto`)   | `200`   |
| `PUT`    | `/users/:id` | Update a user                   | `200`   |
| `DELETE` | `/users/:id` | Delete a user                   | `204`   |

`User` fields: `id` (UUID), `firstName`, `lastName`, `email` (unique),
`createdAt`, `updatedAt`.

Error responses: `400` invalid body / malformed UUID, `404` user not found,
`409` email already in use.

## Tests

```bash
npm run test        # unit
npm run test:e2e    # end-to-end
```
