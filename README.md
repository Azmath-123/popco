# Mukeja Makhana

Storefront and admin dashboard backed by an Express API and PostgreSQL. The frontend and backend are separate workspaces with their own source, dependencies, and configuration.

## Project map

```text
client/                         React + Vite frontend
  index.html                    Browser entry document
  public/                       Images, icons, fonts
  src/
    main.jsx                    Mounts the React app
    App.jsx                     Routes and shared page layout
    pages/                      Store, product, cart, account, admin screens
    features/admin/tabs/         Separate analytics, orders, catalog, stock, coupon, settings UI
    components/                 Reusable storefront UI
    context/StoreContext.jsx    Shared storefront state and actions
    lib/api.js                  HTTP client for /api/v1
  vite.config.js                Frontend plugins and API proxy

server/                         Express + PostgreSQL backend
  .env                          Local database and service settings (private)
  src/
    server.js                   Startup, schema setup, seed, listen, shutdown
    app.js                      Express middleware and final error handling
    http/api-context.js         Shared request helpers, DTOs, auth/rate limits
    config/database.js          PostgreSQL pool and transactions
    database/
      schema.sql                Database tables and indexes
      migrate.js                Applies the schema
      seed.js                   Creates initial catalog and admin data
    middleware/authentication.js Session, JWT, and password helpers
    routes/index.js             Registers feature route modules
    routes/                     Store, account, cart, checkout, order, payment
      admin/                    Catalog, inventory, orders, customers, settings
    modules/payments/           Payment verification and capture logic
    jobs/                       Background mail and order jobs
    seed/catalog-data.js        Initial products, coupons, and reviews
  legacy/                       Archived scaffold from the previous server layout; not imported

scripts/                        Local development and database utilities
```

## Request flow

1. `client/src/main.jsx` mounts `App.jsx`; pages call shared actions in `StoreContext.jsx`.
2. `StoreContext` uses `client/src/lib/api.js` to send JSON requests to `/api/v1`.
3. Vite forwards `/api` requests to the API at `http://localhost:4000` during development.
4. `server/src/app.js` applies security, CORS, cookies, JSON parsing, request IDs, and error handling.
5. `server/src/routes/index.js` registers routes by feature. Each route module validates input and coordinates database work.
6. `server/src/config/database.js` owns the PostgreSQL pool and transactions. Payment-specific rules live under `modules/payments`.
7. Responses are mapped to frontend-friendly objects by the shared DTO helpers in `http/api-context.js`.

For example, adding a cart item follows `ProductDetailPage` → `StoreContext.addToCart` → `lib/api.js` → `routes/cart.routes.js` → PostgreSQL. Checkout uses `routes/checkout.routes.js`; payment confirmation uses `routes/payments.routes.js`.

## Run locally

Requirements: Node.js 20+ and a PostgreSQL database created for this application.

From the project root:

```powershell
npm install
if (!(Test-Path server/.env)) { Copy-Item server/.env.example server/.env }
notepad server/.env
```

Set `DATABASE_URL` to your PostgreSQL connection string and set `JWT_SECRET` to a random value with at least 32 characters. The database user needs permission to create tables and indexes. Keep `server/.env` private.

Start both workspaces:

```powershell
npm run dev
```

Open `http://localhost:5173`. The API listens on `http://localhost:4000`; on startup it applies `server/src/database/schema.sql` and inserts default catalog data.

Run them separately in two terminals from the project root:

```powershell
npm run dev:server
npm run dev:client
```

`Ctrl+C` stops the active process. If you already started the backend separately, use `npm run dev:client` in the other terminal instead of starting a second backend.

## Common commands

| Command | Purpose |
|---|---|
| `npm install` | Install dependencies for both workspaces |
| `npm run dev` | Start frontend and backend together |
| `npm run dev:server` | Start the API with file watching |
| `npm run dev:client` | Start the Vite frontend |
| `npm start` | Start the backend without file watching |
| `npm run build` | Build the frontend into `client/dist` |
| `npm run migrate` | Apply the current database schema |
| `npm run seed` | Insert the default catalog and admin data |
| `npm run setup:database` | Create the database named in `DATABASE_URL` |

The `setup:database` command connects to PostgreSQL’s maintenance database using the credentials in `server/.env`; the account must be allowed to create databases. For a hosted database, create the database with the provider and point `DATABASE_URL` to it instead.
