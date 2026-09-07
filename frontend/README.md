# Mercado del Sur — Frontend

Single-page storefront for the Mercado del Sur furniture shop. Talks to the
[backend API](../backend/README.md).

## Tech stack

| Concern         | Choice                                                        |
| --------------- | ------------------------------------------------------------ |
| Build tool      | [Vite](https://vite.dev/) 8                                  |
| Language        | TypeScript 6 (strict)                                        |
| UI framework    | [React](https://react.dev/) 19                               |
| Component kit   | [Mantine](https://mantine.dev/) 9 (`core`, `hooks`, `form`, `notifications`, `dropzone`) |
| Icons           | `@tabler/icons-react`                                        |
| State / data    | [Redux Toolkit](https://redux-toolkit.js.org/) + RTK Query   |
| Routing         | `react-router-dom` 7                                         |
| i18n            | `i18next` / `react-i18next` — Spanish only, namespaced JSON in `src/locales/es/` |
| Styling         | Mantine + PostCSS (`postcss-preset-mantine`), plus `src/global.css` |
| Linting         | ESLint 10 (flat config) + Prettier (with `organize-imports`) |

Prices are rendered in Uruguayan pesos (UYU); all customer-facing copy lives in
the i18n catalogs.

## Requirements

- Node.js 20+
- A running backend API (see `../backend/README.md`)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your local env file
cp .env.example .env

# 3. Start the dev server (http://localhost:5173)
npm run dev
```

## Environment variables

| Variable       | Description               | Default (`.env.example`)  |
| -------------- | ------------------------- | ------------------------- |
| `VITE_API_URL` | Base URL of the backend API | `http://localhost:3000` |

## Scripts

| Command             | Description                          |
| ------------------- | ----------------------------------- |
| `npm run dev`       | Vite dev server with HMR             |
| `npm run build`     | Type-check (`tsc -b`) + production build to `dist/` |
| `npm run preview`   | Serve the production build locally   |
| `npm run lint`      | ESLint over the project              |
| `npm run typecheck` | Type-check without emitting          |

## Structure

```
src/
  pages/        route components, grouped by domain (products, cart, orders, auth, admin)
  components/    shared + domain components (layout, product, cart, auth, marketing)
  store/        Redux store, one RTK Query API per domain (apis/), auth slice (slices/)
  locales/es/   i18n resources, one JSON namespace per domain
  constants/    route paths
  helpers/      formatting (price, date), API error extraction, notifications
  hooks/        e.g. use-logged-user
  lib/          auth token storage, pending-order handoff across Stripe redirect
  types/        API request/response types, grouped by domain
```

Auth token is persisted in `localStorage` and attached as a Bearer header by
`store/apis/base-query.ts`, which also redirects to `/login` on a `401`.

## Routing

Public: catalog (`/`), product detail, `/login`, `/register`. Authenticated:
cart, checkout success/cancel, orders. Admin-only: product management under
`/admin`. Guards live in `components/ProtectedRoute.tsx` and
`components/AdminRoute.tsx`.
