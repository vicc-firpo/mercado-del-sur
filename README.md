# Mercado del Sur

Full-stack e-commerce demo for an online furniture store. Customers browse a
catalog, manage a cart and pay through Stripe hosted checkout; an admin manages
the product catalog and its images.

## What the app does

- **Catalog** — public product listing with search (accent-insensitive) and
  product detail pages. Prices are in Uruguayan pesos (UYU).
- **Auth** — email/password registration and login with JWT. Two roles:
  `customer` and `admin`.
- **Cart** — one persistent cart per customer; add, update quantity and remove
  items. Deactivated products are dropped from carts automatically.
- **Checkout** — creates an order and a Stripe Checkout session, redirects to
  Stripe's hosted payment page, and marks the order paid from the Stripe
  webhook. The cart is cleared once payment succeeds.
- **Orders** — customers see their own order history and detail.
- **Admin** — create/update/delete products, toggle active status, and
  upload/delete product images (served by the API).

## Repository layout

| Path        | Stack                                              | README                                   |
| ----------- | -------------------------------------------------- | ---------------------------------------- |
| `backend/`  | NestJS · TypeORM · PostgreSQL · Stripe             | [backend/README.md](backend/README.md)   |
| `frontend/` | React 19 · Vite · TypeScript · Mantine · RTK Query | [frontend/README.md](frontend/README.md) |

Each package has its own README with the detail this one leaves out:
[`backend/README.md`](backend/README.md) covers the environment variables, the
database migrations and seeders, the local Stripe setup and the full API
reference; [`frontend/README.md`](frontend/README.md) covers the tech stack, the
environment variables, the npm scripts and the project structure.

## Quick start

Bring up the API (with database and seed data) and then the frontend. Full
details are in each package's README.

```bash
# 1. Backend — Postgres + migrations + seed + API on :3000
cd backend
npm install
cp .env.example .env
docker compose up -d db
npm run migration:run
npm run seed
npm run start:dev

# 2. Frontend — Vite dev server on :5173
cd ../frontend
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173.

### Seed accounts

Both created by `npm run seed` in `backend/`, password `password`:

| Role     | Email                        |
| -------- | ---------------------------- |
| Admin    | `admin@mercadodelsur.com`    |
| Customer | `customer@mercadodelsur.com` |

## Requirements

- Node.js 20+
- Docker + Docker Compose (for PostgreSQL)
- A [Stripe](https://stripe.com) test account and the Stripe CLI (only needed to
  exercise checkout end to end — see `backend/README.md`)
