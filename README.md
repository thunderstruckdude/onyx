# Auction Platform

Production-oriented auction application with a modular Node.js backend, a React frontend, MongoDB transactions, and Socket.io-driven realtime updates.

## Overview

This repository contains a full-stack auction platform designed around a modular monolith backend and a separate Vite-based client. The backend exposes versioned REST APIs under `/api/v1`, keeps bids in a dedicated collection, and uses MongoDB replica-set transactions plus optimistic concurrency control to protect bid writes. The client provides marketplace, live auction, profile, seller studio, finished-auction reporting, and admin views.

## Tech stack

- Backend: Node.js, Express, Mongoose
- Database: MongoDB replica set
- Realtime: Socket.io
- Auth: JWT in HttpOnly cookies
- Validation: Zod
- Security middleware: helmet, cors, hpp, express-mongo-sanitize, rate limiting
- Frontend: React, React Router, Framer Motion, Tailwind CSS, Vite

## Project structure

### Backend

- `src/server.js` starts HTTP, connects to MongoDB, boots Socket.io, and starts the auction finalizer worker.
- `src/app.js` configures middleware, security headers, request parsing, sanitization, and API routing.
- `src/api/v1/index.js` is the versioned route composition entry point. Domain routers live in `src/modules/*`, so the versioned API layer stays thin by design.
- `src/modules/users/` handles auth, profiles, and account updates.
- `src/modules/auctions/` handles auction CRUD, listing, detail views, and analytics.
- `src/modules/bids/` handles bid placement, bid history, and socket bid submission.
- `src/modules/admin/` handles dashboard metrics, user moderation, and auction moderation.
- `src/workers/finalize-auctions.worker.js` sweeps active auctions and finalizes completed ones.
- `src/scripts/` contains demo and flood seeders.

### Frontend

- `client/src/App.jsx` defines routing.
- `client/src/pages/` contains the page-level views.
- `client/src/components/` contains reusable UI blocks.
- `client/src/hooks/` contains auth and auction data hooks.
- `client/src/api/client.js` wraps authenticated API requests.
- `client/src/index.css` holds the visual system and landing-page styling.

## Key runtime behavior

- Auctions are finalized by a background sweep rather than timers tied to a request lifecycle.
- Bids are written inside MongoDB transactions and checked against the auction `__v` version key.
- Live updates are only broadcast after a successful commit.
- Auth uses HttpOnly cookies and role-aware access control.
- Admin routes are restricted to authenticated admin users.

## Ports

- API: `http://localhost:4000`
- Frontend dev server: `http://localhost:5173`
- MongoDB: `localhost:27017`

## Local setup

### Prerequisites

- Node.js 20+
- npm 10+
- Docker and Docker Compose
- Git

### Install on a local machine

Clone the repository and enter it:

```bash
git clone https://github.com/thunderstruckdude/onyx
cd auction
```

Install dependencies for both the backend and client:

```bash
npm install
npm --prefix client install
```

Copy the example environment file and fill in the required values:

```bash
cp .env.example .env
```

Minimum required values:

- `MONGODB_URI`
- `JWT_ACCESS_SECRET`

If you are using Docker, the MongoDB URI can point at the replica-set container name. If you are running MongoDB directly on your machine, the database must be started as a replica set because bid placement uses transactions.

### Start everything with Docker

```bash
npm run docker:up
```

That brings up MongoDB, the API, and the web client. Open `http://localhost:5173` after the containers are healthy.

If you want demo data, seed it after the stack is up:

```bash
npm run seed:demo
```

For a heavier marketplace demo:

```bash
npm run seed:flood
```

### Start the app without Docker

```bash
npm run dev:api
npm --prefix client run dev
```

Or run both together:

```bash
npm run dev:full
```

If you run the backend directly, MongoDB must be reachable as a replica set. The application expects transactional support.

## Demo data

Seed the database with the standard demo set:

```bash
npm run seed:demo
```

Seed the marketplace with a larger themed inventory:

```bash
npm run seed:flood
```

## Environment variables

Backend reads `.env` from the repository root.

Required:

- `MONGODB_URI`
- `JWT_ACCESS_SECRET`


## Scripts

### Root

- `npm run dev` — backend only
- `npm run dev:api` — backend only
- `npm run dev:client` — frontend only
- `npm run dev:full` — backend and frontend together
- `npm run seed:demo` — standard demo data
- `npm run seed:flood` — large themed marketplace seed
- `npm run docker:up` — build and start the compose stack
- `npm run docker:down` — stop the compose stack
- `npm run docker:logs` — tail container logs

### Client

- `npm --prefix client run dev`
- `npm --prefix client run build`
- `npm --prefix client run lint`

## Notes

- The current demo theme uses active/live auctions, finished report pages, profile dashboards, and an admin console.
- The client dev server proxies `/api` and `/socket.io` to the backend.
- `client/dist/` is generated output and should not be committed.

## Contributing

1. Create a feature branch from `main`.
2. Make focused changes and keep the modular structure intact.
3. Run the existing checks before opening a pull request:

```bash
npm run lint
npm --prefix client run lint
npm --prefix client run build
```

4. Use the existing folder conventions:
   - backend features live under `src/modules/<domain>/`
   - shared backend helpers live under `src/utils/`, `src/constants/`, or `src/middlewares/`
   - frontend pages live under `client/src/pages/`
   - reusable frontend pieces live under `client/src/components/`

5. Keep route versioning under `/api/v1/` and add new routers there instead of placing feature routes in `server.js`.
".
