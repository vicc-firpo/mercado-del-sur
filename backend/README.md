# Mercado del Sur — Backend

E-commerce API built with [NestJS](https://nestjs.com/), [TypeORM](https://typeorm.io/),
PostgreSQL and [Stripe](https://stripe.com/) hosted checkout.

## Requirements

- Node.js 20+
- Docker + Docker Compose (for the database)
- Stripe CLI + a Stripe test account (only to run checkout end to end)

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

# 5. Seed the database (admin, customer, product catalog)
npm run seed

# 6. Start the API (watch mode)
npm run start:dev
```

The API listens on `http://localhost:3000` by default (`PORT` in `.env`).

## Environment variables

| Variable                | Description                                | Default (`.env.example`)                  |
| ----------------------- | ----------------------------------------- | ---------------------------------------- |
| `PORT`                  | HTTP port for the API                      | `3000`                                   |
| `DB_HOST`               | PostgreSQL host                            | `localhost`                              |
| `DB_PORT`               | PostgreSQL port (host side)                | `5432`                                   |
| `DB_USER`               | PostgreSQL user                            | `mercado_del_sur`                        |
| `DB_PASSWORD`           | PostgreSQL password                        | `mercado_del_sur`                        |
| `DB_NAME`               | PostgreSQL database name                   | `mercado_del_sur`                        |
| `JWT_SECRET`            | Secret used to sign auth tokens            | `dev-secret-change-me`                   |
| `JWT_EXPIRES_IN`        | Auth token lifetime (`ms` format)          | `15d`                                    |
| `FRONTEND_URL`          | Allowed CORS origin / checkout base URL    | `http://localhost:5173`                  |
| `STRIPE_SECRET_KEY`     | Stripe secret API key (`sk_test_…`)        | `sk_test_secret_key`                     |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for the webhook (`whsec_…`) | `whsec_webhook_secret`                   |
| `STRIPE_CURRENCY`       | ISO currency for Stripe line items         | `uyu`                                    |
| `CHECKOUT_SUCCESS_URL`  | Redirect after a successful payment        | `http://localhost:5173/checkout/success` |
| `CHECKOUT_CANCEL_URL`   | Redirect after a cancelled payment         | `http://localhost:5173/checkout/cancel`  |

`docker-compose.yml` reads the same `.env` file, so the database credentials and
the API configuration always stay in sync.

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

## Seeding

```bash
npm run seed
```

`npm run seed` (`src/database/seeds/seed.ts`) is idempotent — re-running it skips
anything that already exists. It creates:

- an **admin** user — `admin@mercadodelsur.com` / `password`
- a **customer** user — `customer@mercadodelsur.com` / `password`
- an empty cart for the customer
- the furniture catalog from `src/database/seeds/product-catalog.ts` (24
  products in Spanish, prices in UYU), each with three images **downloaded from
  Unsplash** into `data/images/`.

Image downloads are best effort: if a download fails (e.g. no network), that
product is left without images and the next `npm run seed` retries only the
missing ones. Run migrations before seeding.

## Stripe checkout (local)

Checkout uses Stripe's hosted Checkout page plus a webhook that marks the order
as paid. To exercise it locally:

1. Put your Stripe **test** secret key in `.env` as `STRIPE_SECRET_KEY`
   (`sk_test_…`).
2. Forward Stripe events to the local API with the
   [Stripe CLI](https://stripe.com/docs/stripe-cli):

   ```bash
   stripe login
   stripe listen --forward-to localhost:3000/stripe/webhook
   ```

3. Copy the `whsec_…` signing secret the CLI prints into `.env` as
   `STRIPE_WEBHOOK_SECRET`, then restart the API.
4. Start a checkout from the frontend and pay with Stripe's test card
   `4242 4242 4242 4242` (any future expiry / CVC). On `checkout.session.completed`
   the webhook marks the order `isPaid` and clears the cart.

`main.ts` enables `rawBody` so the webhook can verify the Stripe signature.

---

# API

Base URL `http://localhost:3000`. All request and response bodies are JSON
(except image upload, which is `multipart/form-data`, and image download, which
returns the binary).

**Auth** — send the JWT from `register` / `login` as `Authorization: Bearer <token>`.

| Column   | Meaning                                                               |
| -------- | -------------------------------------------------------------------- |
| `—`      | public                                                               |
| `Bearer` | any authenticated user                                               |
| `Admin`  | admin role only                                                      |
| `Opt.`   | optional token — works logged out; admins additionally see inactive products |

Common errors: `400` invalid body / malformed UUID, `401` missing or invalid
token, `403` insufficient role, `404` not found.

## Auth

| Method | Path             | Description                        | Auth   | Success |
| ------ | ---------------- | --------------------------------- | ------ | ------- |
| `POST` | `/auth/register` | Register a user, returns a token   | —      | `201`   |
| `POST` | `/auth/login`    | Log in, returns a token            | —      | `200`   |
| `POST` | `/auth/logout`   | Client-side logout (discard token) | Bearer | `204`   |

`register` body: `{ firstName, lastName, email, password }` (password 8–72 chars).
`login` body: `{ email, password }`.

Both respond with `{ accessToken, user }`, where `user` is a `UserDto` and
`accessToken` is a JWT valid for `JWT_EXPIRES_IN` (15 days). Logout is stateless
— the server does not revoke the token, the client just discards it.

Errors: `401` invalid credentials, `409` email already in use.

The `user` object is a `UserDto`:
`{ id, firstName, lastName, email, role, createdAt, updatedAt }` — `role` is
`customer` or `admin`, and the password hash is never returned. There are no
standalone user endpoints; a user is only ever obtained from `register` / `login`.

## Products

| Method   | Path                                  | Description                          | Auth  | Success |
| -------- | ------------------------------------- | ----------------------------------- | ----- | ------- |
| `GET`    | `/products`                           | List products                        | Opt.  | `200`   |
| `GET`    | `/products/:id`                       | Get one product                      | Opt.  | `200`   |
| `POST`   | `/products`                           | Create a product                     | Admin | `201`   |
| `PUT`    | `/products/:id`                       | Replace name / description / price   | Admin | `200`   |
| `PATCH`  | `/products/:id`                       | Toggle active status                 | Admin | `200`   |
| `DELETE` | `/products/:id`                       | Delete a product                     | Admin | `204`   |
| `POST`   | `/products/:id/images`                | Upload an image (`multipart`, `file`) | Admin | `201`   |
| `GET`    | `/products/:id/images/:imageId`       | Download an image (binary)            | —     | `200`   |
| `DELETE` | `/products/:id/images/:imageId`       | Delete an image                      | Admin | `204`   |

`GET /products` query params:

- `status` — `active` (default for non-admins), `inactive`, or `all`. Non-admins
  only ever see active products regardless of this value.
- `search` — accent-insensitive, case-insensitive match on name/description
  (max 100 chars).

`ProductDto`: `{ id, name, description, price, active, images, createdAt, updatedAt }`.
`images` is an array of `{ id, extension, url, productId, createdAt, updatedAt }`
where `url` is the relative download path.

`POST /products` body: `{ name, description, price, active? }` (`price` positive,
max 2 decimals). `PUT /products/:id` body: `{ name, description, price }`.
`PATCH /products/:id` body: `{ active: boolean }`.

Image upload: `multipart/form-data` with a `file` field. Max 5 MB; `image/jpeg`,
`image/png` and `image/webp` only (`400` otherwise).

## Cart

One cart per user, created automatically at registration. All routes require a
token.

| Method   | Path                       | Description                       | Auth   | Success |
| -------- | -------------------------- | -------------------------------- | ------ | ------- |
| `GET`    | `/cart`                    | Get the current user's cart       | Bearer | `200`   |
| `PUT`    | `/cart/items/:productId`   | Set the quantity of a product     | Bearer | `200`   |
| `DELETE` | `/cart/items/:productId`   | Remove a product from the cart    | Bearer | `204`   |

`PUT /cart/items/:productId` body: `{ quantity: number }` (integer ≥ 1); it sets
the absolute quantity for that product.

`CartDto`: `{ items: [{ product: ProductDto, quantity, subtotal }], total }`.

## Checkout

| Method | Path             | Description                                  | Auth   | Success |
| ------ | ---------------- | ------------------------------------------- | ------ | ------- |
| `POST` | `/cart/checkout` | Create an order + Stripe Checkout session   | Bearer | `200`   |

Creates an `Order` from the current cart and returns
`{ orderId, checkoutUrl }` — redirect the browser to `checkoutUrl`. The cart is
**not** cleared here; it is cleared by the webhook once payment succeeds.

Errors: `400` cart is empty, `400` cart contains an inactive product.

## Stripe webhook

| Method | Path              | Description                          | Auth               | Success |
| ------ | ----------------- | ----------------------------------- | ------------------ | ------- |
| `POST` | `/stripe/webhook` | Receive Stripe events               | Stripe signature   | `200`   |

Not called by clients — Stripe calls it. The `stripe-signature` header is
verified against `STRIPE_WEBHOOK_SECRET` (`400` if invalid). On
`checkout.session.completed` with `payment_status = paid`, the matching order is
marked `isPaid` and the buyer's cart is cleared.

## Orders

All routes require a token; users only ever see their own orders.

| Method | Path          | Description                    | Auth   | Success |
| ------ | ------------- | ---------------------------- | ------ | ------- |
| `GET`  | `/orders`     | List the current user's orders | Bearer | `200`   |
| `GET`  | `/orders/:id` | Get one of the user's orders   | Bearer | `200`   |

`OrderSummaryDto` (list): `{ id, total, itemCount, isPaid, createdAt }`.
`OrderDetailDto`: `{ id, total, isPaid, createdAt, items }` where each item is
`{ productName, productDescription, unitPrice, quantity, subtotal }` (a snapshot
taken at checkout, so it survives later product changes).

Errors: `404` when the order does not exist or belongs to another user.

## Tests

```bash
npm run test        # unit
npm run test:cov    # unit + coverage
npm run test:e2e    # end-to-end
```
