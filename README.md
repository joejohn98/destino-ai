# Destino AI

Destino AI is a luxury, editorial travel platform and AI-powered trip-planning suite. It pairs a verified travel catalog (continents, countries, destinations, attractions, and community reviews) with agentic AI tools for generating personalized multi-day itineraries and side-by-side destination comparisons.

---

## Architecture Overview

The repository is organized as an npm monorepo with three core workspaces:

```text
destino-ai/
├── packages/
│   └── shared/          # @destino/shared — Shared TypeScript contracts, DTOs, and schemas
├── backend/             # @destino/backend — Express 5 REST API, MongoDB/Mongoose, Redis, AI agents
├── frontend/            # Next.js 16 (App Router) luxury editorial client
├── backend/compose.dev.yaml # Backend, MongoDB replica set, and Redis for local development
├── frontend/compose.dev.yaml # Frontend development container
└── package.json         # Monorepo workspace configuration and orchestration scripts
```

### Project Layout

- **`packages/shared/`** — Shared TypeScript contracts and DTOs (`@destino/shared`)
- **`backend/`** — Express 5 REST API, MongoDB/Mongoose, Redis, AI agents
- **`frontend/`** — Next.js 16 App Router client

### High-Level Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Base UI and shadcn components, Lucide icons, Sonner toasts.
- **Backend:** Express v5, TypeScript, Mongoose v9 (MongoDB), Redis (Redis 7 in development Compose), Google Gemini API via Vercel AI SDK (`ai` & `@ai-sdk/google`), Cloudinary (media storage), Passport (Google & GitHub OAuth).
- **Shared:** `@destino/shared` CommonJS package providing shared DTO contracts and interfaces.

---

## Workspace Documentation

Detailed component-level setup, architecture, and API details can be found in each workspace:

- 📖 **[Frontend Documentation](frontend/README.md)**: Routing architecture, design tokens, UI components, client state, and environment variables.
- 📖 **[Backend Documentation](backend/README.md)**: REST endpoints, AI agents, database models, Redis caching, authentication flows, and seeding.
- 🐳 **Docker Workflows**:
  - [Backend Docker Guide](backend/DOCKER.md)
  - [Frontend Docker Guide](frontend/DOCKER.md)

---

## Quickstart (Local Monorepo Development)

### 1. Prerequisites

- **Node.js**: Use Node.js 22, the version used by the Dockerfiles.
- **npm**: Use the npm version bundled with Node.js 22.
- **MongoDB**: Running instance (v6+ with replica set enabled if running natively) or Docker
- **Redis**: Running instance (v6+) or Docker
- **Google Gemini API Key**: Required for Gemini-backed AI features; required by the backend in production.

### 2. Installation

Install dependencies across all monorepo workspaces from the repository root:

```bash
npm install
```

Build the shared package before starting development:

```bash
npm run build:shared
```

> **Note:** Building the shared package generates TypeScript declarations that the backend and frontend depend on. Run this before starting development servers.

### 3. Environment Configuration

Create the local environment files:

#### Backend Setup

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and configure `DATABASE_URL`, `REDIS_URL`, and `JWT_SECRET` for local services. Set `PORT=5000` to match the frontend's local API default. Set `GOOGLE_GENERATIVE_AI_API_KEY` to use Gemini-backed features. Cloudinary and OAuth variables are optional; configure each integration as a complete variable group. See [backend/README.md](backend/README.md) for production requirements.

#### Frontend Setup

Create `frontend/.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 4. Running the Development Servers

Start each service from a separate terminal at the repository root after MongoDB and Redis are available. The backend's native default port is 3000; set `PORT=5000` in `backend/.env` to match the frontend's local API default.

- **Start Backend API** (runs on `PORT`, default `3000`, via `tsx watch`):
  ```bash
  npm run dev:backend
  ```
- **Start Frontend App** (Runs on `http://localhost:3000`):
  ```bash
  npm run dev:frontend
  ```

---

## Monorepo Scripts Reference

All top-level commands are run from the project root:

| Command                  | Description                                                               |
| :----------------------- | :------------------------------------------------------------------------ |
| `npm run build`          | Builds `@destino/shared`, `@destino/backend`, and `frontend` in sequence. |
| `npm run build:shared`   | Compiles the shared TypeScript contracts in `packages/shared/`.           |
| `npm run build:backend`  | Compiles TypeScript files in `backend/` to `backend/dist/`.               |
| `npm run build:frontend` | Creates an optimized Next.js production build for `frontend/`.            |
| `npm run dev:backend`    | Launches the Express API server with live-reloading.                      |
| `npm run dev:frontend`   | Launches Next.js in development mode.                                     |
| `npm run type-check`     | Runs type checks across shared, backend, and frontend packages.           |
| `npm run lint`           | Lints backend and frontend source directories.                            |

---

## Database Seeding

The backend includes a comprehensive database seeder that populates verified continents, countries, destinations, attractions, demo users, and reviews.

```bash
# From the backend workspace
cd backend
npm run seed -- --force
```

> **Note**: Seeding is destructive and resets catalog data. Use `--force` (or `--confirm` / `SEED_ALLOW_DESTRUCTIVE=1`) to confirm. Seeding is disabled in production. When using the Docker Compose development setup, execute the seed inside the running container as documented in [backend/DOCKER.md](backend/DOCKER.md).

---

## Type Checking, Linting & Health

- **Type Safety**:
  ```bash
  npm run type-check
  ```
- **Code Linting**:
  ```bash
  npm run lint
  ```
- **Health Check**:
  With the backend running, verify MongoDB and Redis connectivity at:
  ```text
  GET http://localhost:<PORT>/health
  ```

There are currently no automated test scripts defined in the root or workspace package manifests. The commands above provide type checking, linting, and a runtime health check.

---

## License

ISC License. Private repository.
