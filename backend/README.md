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
| `JWT_SECRET`     | Secret used to sign auth tokens | `dev-secret-change-me` |
| `JWT_EXPIRES_IN` | Auth token lifetime (`ms` format) | `15d`                |

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

## API — Auth

| Method  | Path                    | Description                          | Auth   | Success |
| ------- | ----------------------- | ----------------------------------- | ------ | ------- |
| `POST`  | `/auth/register`        | Register a user, returns a token     | —      | `201`   |
| `POST`  | `/auth/login`           | Log in, returns a token              | —      | `200`   |
| `POST`  | `/auth/logout`          | Client-side logout (discard token)   | Bearer | `204`   |
| `PATCH` | `/auth/change-password` | Change the current user's password   | Bearer | `204`   |

`register` and `login` respond with `{ accessToken, user }`. The `accessToken` is a JWT
valid for 15 days (`JWT_EXPIRES_IN`); send it as `Authorization: Bearer <token>` on
protected routes. Logout is stateless — the server does not revoke the token, the client
just discards it.

`change-password` body: `{ currentPassword, newPassword }`.

Error responses: `400` invalid body, `401` invalid credentials / missing or invalid
token, `409` email already in use.

## API — Users

| Method   | Path         | Description                     | Success |
| -------- | ------------ | ------------------------------- | ------- |
| `GET`    | `/users`     | List all users (`UserDto[]`)    | `200`   |
| `GET`    | `/users/:id` | Get a single user (`UserDto`)   | `200`   |
| `PUT`    | `/users/:id` | Update a user                   | `200`   |
| `DELETE` | `/users/:id` | Delete a user                   | `204`   |

Users are created through `POST /auth/register`.

`User` fields: `id` (UUID), `firstName`, `lastName`, `email` (unique),
`createdAt`, `updatedAt`. The password hash is never returned.

Error responses: `400` invalid body / malformed UUID, `404` user not found,
`409` email already in use.

## Tests

```bash
npm run test        # unit
npm run test:e2e    # end-to-end
```
