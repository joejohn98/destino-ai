# Destino AI — Backend Service (`@destino/backend`)

The backend service for Destino AI is a RESTful API built on Express 5 and TypeScript. It powers user authentication, catalog management (continents, countries, destinations, attractions), community reviews, user favorites, and AI-driven travel intelligence (itinerary planning and destination comparisons).

---

## Tech Stack

* **Runtime & Framework:** Node.js, Express v5 (`express@^5.2.1`), TypeScript
* **Database & ODM:** MongoDB, Mongoose v9 (`mongoose@^9.10.2`)
* **Caching & Rate Limiting:** Redis server (Redis 7 in the development Compose setup), Node.js client `redis@^6.3.0`, `express-rate-limit`, `rate-limit-redis`
* **AI & Agentic Workflows:** Vercel AI SDK (`ai@^7.0.136`, `@ai-sdk/google@^4.0.93`), Google Gemini
* **Authentication:** JWT (`jsonwebtoken`), HTTP-only cookies (`cookie-parser`), Passport (`passport-google-oauth20`, `passport-github2`), `bcryptjs`
* **File Uploads:** Multer (memory storage) and Cloudinary SDK v2
* **Validation & Utilities:** Zod v4, slugify, morgan

---

## Directory Structure

```text
backend/
├── src/
│   ├── agents/          # Agentic AI tools and multi-step workflows (plan-itinerary, compare)
│   ├── config/          # Environment configuration, Passport strategies, Redis client
│   ├── controllers/     # Route handlers for auth, destinations, reviews, continents, etc.
│   ├── dto/             # Data transfer objects and request interfaces
│   ├── middleware/      # Auth verification, admin guard, error handling, file upload
│   ├── models/          # Mongoose schemas (Continent, Country, Destination, Review, User)
│   ├── routes/          # Express route definitions
│   ├── scripts/         # Database seeding script (seed.ts)
│   ├── services/        # Business logic layer
│   ├── tools/           # Custom AI execution tools for agent pipelines
│   ├── types/           # Backend-specific TypeScript definitions
│   ├── utils/           # Helper utilities (token management, response formats)
│   ├── validators/      # Zod validation schemas
│   ├── app.ts           # Express application setup and middleware registration
│   └── index.ts         # Server entry point, database connection, graceful shutdown
├── compose.dev.yaml     # Docker Compose for local dev (API, MongoDB replica set, Redis)
├── compose.production.yaml # Production deployment compose file
├── Dockerfile           # Multi-stage production build Dockerfile
├── DOCKER.md            # Detailed Docker run instructions
└── package.json         # Workspace package configuration
```

---

## Environment Variables

Copy `.env.example` to create your local `.env`:

```bash
cp .env.example .env
```

| Variable | Required | Description | Example |
| :--- | :---: | :--- | :--- |
| `PORT` | No | API port (defaults to 3000 in the application; Compose sets 5000) | `5000` |
| `NODE_ENV` | No | Application environment | `development` or `production` |
| `CLIENT_URL` | Production | Frontend origin for CORS; defaults to `http://localhost:3000` outside production | `http://localhost:3000` |
| `DATABASE_URL` | Backend runtime | MongoDB connection string; required to connect, with a replica set needed for transaction-backed operations | `mongodb://localhost:27017/destino` |
| `REDIS_URL` | Production | Redis connection string for caching and rate limiting; defaults to local Redis outside production | `redis://localhost:6379` |
| `JWT_SECRET` | Authentication / production | Secret used for signing auth tokens; required for authentication and at least 32 characters in production | Configure privately |
| `JWT_EXPIRATION` | No | Expiration time for authentication tokens | `7d` |
| `TRUST_PROXY` | No | Trusted proxy hop count or comma-separated IP/CIDR values; literal `true` is unsupported | `false` or `1` |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Production / AI features | API key for Google Gemini model access | Configure privately |
| `CLOUDINARY_CLOUD_NAME` | Optional | Cloudinary cloud name for image uploads | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Optional | Cloudinary API Key | `your_api_key` |
| `CLOUDINARY_API_SECRET` | Optional | Cloudinary API Secret | `your_api_secret` |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth client ID | `your_google_client_id` |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth client secret | `your_google_client_secret` |
| `GOOGLE_CALLBACK_URL` | Optional | Google OAuth callback URL | `http://localhost:5000/api/auth/google/callback` |
| `GITHUB_CLIENT_ID` | Optional | GitHub OAuth client ID | `your_github_client_id` |
| `GITHUB_CLIENT_SECRET` | Optional | GitHub OAuth client secret | `your_github_client_secret` |
| `GITHUB_CALLBACK_URL` | Optional | GitHub OAuth callback URL | `http://localhost:5000/api/auth/github/callback` |

---

## Development Setup

### 1. Native Setup

1. Install dependencies from the repository root:
   ```bash
   npm install
   ```
2. Build the shared package:
   ```bash
   npm run build:shared
   ```
3. Start the API with hot-reloading (`tsx watch`):
   ```bash
   cd backend
   npm run dev
   ```
   The API listens on `PORT` (3000 by default). Set `PORT=5000` in `.env` to use the frontend's default local API URL.

### 2. Docker Setup

From `backend/`, run the API with isolated MongoDB (configured as a single-node replica set) and Redis:

```bash
docker compose -f compose.dev.yaml up --build
```

Refer to [`DOCKER.md`](DOCKER.md) for complete details on volume persistence and replica set hostname mapping.

---

## Database Seeding

To populate demo continents, countries, destinations, attractions, users, and reviews:

```bash
npm run seed -- --force
```

*(Or via Docker)*:
```bash
docker compose -f compose.dev.yaml exec api npm run seed -- --force
```

---

## API Routes Overview

* **Health**:
  * `GET /health` or `GET /api/health` — Checks MongoDB connection and Redis readiness.
* **Authentication (`/api/auth`)**:
  * `POST /api/auth/register` — Register a new account.
  * `POST /api/auth/login` — Sign in and receive an HTTP-only JWT cookie.
  * `POST /api/auth/logout` — Clear session cookies.
  * `GET /api/users/profile` — Current authenticated user profile.
  * `GET /api/auth/google` & `GET /api/auth/github` — OAuth social login.
* **Destinations (`/api/destinations`)**:
  * `GET /api/destinations` — Paginated list with category, search, and rating filters.
  * `GET /api/destinations/:name` — Destination details by name or slug.
  * `POST /api/destinations` — Create destination (Admin only, supports multipart images).
  * `PUT /api/destinations/:id` — Update destination (Admin only).
  * `DELETE /api/destinations/:id` — Delete destination (Admin only).
* **Canonical Hierarchy**:
  * `GET /api/countries/:countrySlug/destinations` — Destinations within a country.
  * `GET /api/countries/:countrySlug/destinations/:destinationSlug` — Canonical destination details.
  * `GET /api/countries/:countrySlug/destinations/:destinationSlug/reviews` — Destination reviews.
* **Reviews (`/api/reviews`)**:
  * `POST /api/countries/:countrySlug/destinations/:destinationSlug/reviews` — Submit review.
  * `PATCH /api/reviews/:reviewId` — Update own review.
  * `DELETE /api/reviews/:reviewId` — Delete own review.
* **Favorites (`/api/users/favorites`)**:
  * `GET /api/users/favorites` — Paginated list of favorited destinations.
  * `POST /api/users/favorites/:destinationId` — Add to favorites.
  * `DELETE /api/users/favorites/:destinationId` — Remove from favorites.
* **Admin Management (`/api/admin`)**:
  * Continents: `GET`, `POST`, `PUT`, `DELETE` on `/api/admin/continents`.
  * Countries: `GET`, `POST` on `/api/admin/continents/:continentId/countries`; `PUT`, `DELETE` on `/api/admin/countries/:id`.
* **AI Travel Intelligence (`/api/ai`)**:
  * `POST /api/ai/agents/plan-itinerary` — Authenticated multi-day itinerary planner.
  * `POST /api/ai/agents/compare` — Authenticated comparison of multiple destinations.
  * `GET /api/ai/destinations/:destinationId/summary` and `/tips` — AI-generated destination content.
  * `POST /api/ai/destinations/:destinationId/summary/regenerate` — Refresh destination AI review summary (Admin only).

---

## Development Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Runs the API server with live-reloading (`tsx watch src/index.ts`). |
| `npm run build` | Compiles TypeScript into JavaScript (`dist/`). |
| `npm run start` | Runs the compiled production code (`node dist/index.js`). |
| `npm run type-check` | Validates TypeScript types (`tsc --noEmit`). |
| `npm run lint` | Runs ESLint over `src/`. |
| `npm run format` | Formats code with Prettier. |
| `npm run format:check` | Verifies code formatting rules. |
| `npm run seed` | Seeds initial data into MongoDB; requires `--force`, `--confirm`, or `SEED_ALLOW_DESTRUCTIVE=1` and is disabled in production. |

---

## Related Documentation

* ⬅️ **[Monorepo Root README](../README.md)**
* ➡️ **[Frontend Documentation](../frontend/README.md)**
* 🐳 **[Backend Docker Guide](DOCKER.md)**
