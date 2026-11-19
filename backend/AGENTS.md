# Destino AI — Backend Codebase Context for AI Agents

> **Purpose:** This file is the authoritative reference for AI coding agents (Antigravity, Codex, Claude Code, Cursor, etc.) working on this codebase. Read it fully before generating code, suggesting edits, or answering questions about the project. Do **not** invent details not found here.

---

## 1. Project Identity & Stack

| Field | Value | Notes |
|-------|-------|-------|
| Package Name | `@destino/backend` | Root package in monorepo structure |
| Runtime | Node.js (CommonJS — `"type": "commonjs"`) | Node 22 in production Docker |
| Language | TypeScript 5.9.x | Strictest compiler settings, target ES2022 |
| Framework | **Express.js v5** (`^5.2.1`) | Native async error forwarding in routes |
| Shared Types | `@destino/shared` | Monorepo package for shared DTOs & constants |
| Database | MongoDB via **Mongoose 9.x** | Configured connection pool (`maxPoolSize: 20`) |
| Cache & Rate Limiting | **Redis 6.x** (`redis` npm client) | Graceful fallback if Redis is unavailable |
| AI Integration | **Vercel AI SDK** (`ai@^7`) + `@ai-sdk/google` | Lazy dynamic import via `src/utils/ai-sdk.ts` |
| Authentication | JWT (HTTP-only cookie + Bearer header) | Passport.js (Google & GitHub OAuth2) |
| Validation | **Zod v4** throughout | Body validation & typed query param parsing |
| Media Storage | **Multer v2** (memory storage) → **Cloudinary v2** | Streamed image uploads |
| Dev Runner | `tsx watch src/index.ts` | Hot-reloading TypeScript dev runner |
| Build Tool | `tsc` → `dist/` | Standard TypeScript compilation |

---

## 2. Directory Structure

```
backend/
├── src/
│   ├── index.ts                     ← Server entry, graceful shutdown, AWS ALB keep-alive
│   ├── app.ts                       ← Express app factory, middleware stack, route mounts
│   │
│   ├── config/
│   │   ├── config.ts                ← Centralized env vars with Zod validation
│   │   ├── db.ts                    ← Mongoose connection & pool settings
│   │   ├── redis.ts                 ← Redis client, connect/disconnect, fallback logic
│   │   ├── passport.ts              ← Passport Google & GitHub OAuth strategies
│   │   ├── cloudinary.ts            ← Cloudinary SDK initialization
│   │   └── country-cost-profiles.ts ← Country-specific cost tiers & transit multipliers
│   │
│   ├── models/
│   │   ├── index.ts                 ← Barrel export of all models
│   │   ├── User.model.ts            ← Users, auth providers, favorites
│   │   ├── Destination.model.ts     ← Destinations, attractions, ratings, categories
│   │   ├── Country.model.ts         ← Countries with continent reference & virtuals
│   │   ├── Continent.model.ts       ← Continents
│   │   └── Review.model.ts          ← Destination reviews & sentiment
│   │
│   ├── dto/                         ← Typed Data Transfer Objects
│   │   ├── destination.dto.ts       ← Destination cards, lists, detail DTOs
│   │   ├── review.dto.ts            ← Review DTOs, author summaries
│   │   └── user.dto.ts              ← User profile, favorites page DTOs
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts       ← Register, login, logout, OAuth callbacks
│   │   ├── user.controller.ts       ← Profile, user favorites, my reviews
│   │   ├── destination.controller.ts← Public & admin destination handlers
│   │   ├── continent.controller.ts  ← Admin continent handlers
│   │   ├── country.controller.ts    ← Admin country handlers
│   │   ├── review.controller.ts     ← Review CRUD
│   │   ├── ai.controller.ts         ← Destination summaries & travel tips
│   │   └── agent.controller.ts      ← Multi-step AI planner & comparison
│   │
│   ├── services/
│   │   ├── auth.service.ts          ← Pure business logic for auth & social login
│   │   ├── user.service.ts          ← Profile updates, user favorites mutations
│   │   ├── destination.service.ts   ← Facade orchestrator for destination queries/mutations
│   │   ├── destination-query.service.ts    ← Search, pagination, category & location filters
│   │   ├── destination-mutation.service.ts ← Destination creation, updates, transactional deletes
│   │   ├── destination-stats.service.ts    ← Continent & country statistics aggregations
│   │   ├── continent.service.ts     ← Continent queries & transactional deletes
│   │   ├── country.service.ts       ← Country queries & transactional deletes
│   │   ├── review.service.ts        ← Review operations with sentiment analysis
│   │   ├── ai.service.ts            ← Gemini review summaries & travel tips
│   │   ├── agent.service.ts         ← ToolLoopAgent planner & comparison runner
│   │   ├── agent-grounding.service.ts      ← Enforces verified attraction & review grounding
│   │   ├── agent-error.service.ts   ← Categorizes AI/provider errors into AgentError
│   │   ├── budget-calculation.service.ts   ← Trip & destination budget estimation
│   │   ├── cost-profile.service.ts  ← Daily cost profiles by country & travel style
│   │   ├── currency.service.ts      ← Multi-currency conversion & formatting
│   │   └── cloudinary.service.ts    ← Cloudinary stream upload & deletion
│   │
│   ├── routes/
│   │   ├── auth.routes.ts           ← /api/auth
│   │   ├── user.routes.ts           ← /api/users
│   │   ├── destination.routes.ts    ← /api/destinations
│   │   ├── continent.routes.ts      ← /api/admin/continents
│   │   ├── country.routes.ts        ← /api/admin/countries & continent sub-routes
│   │   ├── review.routes.ts         ← /api/countries/.../reviews & /api/reviews
│   │   ├── ai.routes.ts             ← /api/ai
│   │   └── agent.routes.ts          ← /api/ai/agents
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts       ← protect(), restrictTo()
│   │   ├── error.middleware.ts      ← globalErrorHandler, notFoundHandler, serializeError
│   │   ├── validation.middleware.ts ← validate(zodSchema), parseQuery(zodSchema)
│   │   ├── upload.middleware.ts     ← uploadSingle(), uploadArray() via Multer
│   │   └── ratelimit.middleware.ts  ← agentLimiter, aiLimiter, authLimiter (Redis-backed)
│   │
│   ├── validators/
│   │   ├── auth.validators.ts       ← Register, login schemas
│   │   ├── user.validators.ts       ← Update profile schemas
│   │   ├── destination.validators.ts← Destination create/update schemas
│   │   ├── continent.validators.ts  ← Continent create/update schemas
│   │   ├── country.validators.ts    ← Country create/update schemas
│   │   ├── review.validators.ts     ← Review create/update & pagination schemas
│   │   ├── query.validators.ts      ← Query string schemas (pagination, search, filter)
│   │   └── ai.validators.ts         ← AI agent query request schemas
│   │
│   ├── agents/
│   │   ├── planner.agent.ts         ← Itinerary planner system prompt, tools & schema
│   │   └── comparison.agent.ts      ← Destination comparison prompt, tools & schema
│   │
│   ├── tools/
│   │   ├── destination.tools.ts     ← searchDestinations, getDestinationDetails
│   │   ├── review.tools.ts          ← getDestinationReviews
│   │   └── budget.tools.ts          ← estimateTripBudget, estimateDestinationBudget
│   │
│   ├── utils/
│   │   ├── AppError.ts              ← Operational HTTP error class
│   │   ├── AgentError.ts            ← Structured error class for AI agent failures
│   │   ├── catchAsync.ts            ← Async route handler wrappers
│   │   ├── cache.ts                 ← withCache, invalidateKeys, invalidatePattern
│   │   ├── mongo-transactions.ts    ← withMongoTransaction helper
│   │   ├── search-normalization.ts  ← Normalization helpers for search & indexes
│   │   ├── ai-sdk.ts                ← Dynamic ESM loader singleton for Vercel AI SDK
│   │   ├── validation.ts            ← isValidObjectId, escapeRegex
│   │   └── utils.ts                 ← JWT creation, cookie options, sanitizeUser
│   │
│   └── scripts/
│       ├── seed.ts                  ← Destructive DB seed runner (requires --force)
│       └── seed-data/               ← Fixtures for continents, countries, destinations, users, reviews
│
├── dist/                            ← Compiled JavaScript (gitignored)
├── Dockerfile                       ← Production multi-stage Alpine container
├── compose.dev.yaml                 ← Docker compose for local dev (App, Mongo, Redis)
├── compose.production.yaml          ← Production compose setup
├── package.json
└── tsconfig.json
```

---

## 3. Environment Variables (`src/config/config.ts`)

Validated at application startup using a strict **Zod** schema with custom `.superRefine()` rules for production mode.

| Variable | Required in Prod | Default / Fallback | Purpose |
|----------|:----------------:|-------------------|---------|
| `PORT` | No | `3000` | HTTP listening port |
| `NODE_ENV` | No | `"development"` | `"development"`, `"test"`, or `"production"` |
| `DATABASE_URL` | **Yes** | — | MongoDB URI (must start with `mongodb://` or `mongodb+srv://`) |
| `JWT_SECRET` | **Yes** | — | Minimum 32 chars in prod, no placeholder text |
| `JWT_EXPIRATION` | No | `"7d"` | Duration string parsed by `ms` (e.g. `"7d"`, `"24h"`) |
| `REDIS_URL` | **Yes** | `redis://localhost:6379` | Redis connection URL (`redis://` or `rediss://`) |
| `TRUST_PROXY` | No | `false` | Reverse proxy hop count (e.g. `1` for ALB) or CIDR array |
| `CLIENT_URL` | **Yes** | `http://localhost:3000` (dev) | Frontend origin for CORS whitelist (must be `https://` in prod) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | **Yes** | — | Gemini API key for AI tips, summaries, & agents |
| `CLOUDINARY_CLOUD_NAME` | **Yes** | — | Cloudinary cloud identifier |
| `CLOUDINARY_API_KEY` | **Yes** | — | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | **Yes** | — | Cloudinary API secret |
| `GOOGLE_CLIENT_ID` | Optional | — | Google OAuth2 client ID (strategy disabled if omitted) |
| `GOOGLE_CLIENT_SECRET` | Optional | — | Google OAuth2 client secret |
| `GOOGLE_CALLBACK_URL` | Optional | — | Google OAuth2 redirect callback URL |
| `GITHUB_CLIENT_ID` | Optional | — | GitHub OAuth2 client ID (strategy disabled if omitted) |
| `GITHUB_CLIENT_SECRET` | Optional | — | GitHub OAuth2 client secret |
| `GITHUB_CALLBACK_URL` | Optional | — | GitHub OAuth2 redirect callback URL |
| `SEED_ALLOW_DESTRUCTIVE` | No | `0` | Set to `1` or pass `--force` to run `npm run seed` |

---

## 4. Database Models & Schema Design

All constants (`CATEGORIES`, `ATTRACTION_CATEGORIES`, `SENTIMENTS`) are imported from `@destino/shared`.

### 4.1 User (`src/models/User.model.ts`)
- **Collection:** `users`
- **Fields:** `firstName`, `lastName`, `username` (unique, lowercase), `email` (unique, lowercase), `password` (`select: false`, bcrypt hashed with cost 12), `authProviders` (`[{ provider: "google"|"github", providerId }]`), `role` (`"user" | "admin"`), `avatarUrl`, `bio`, `favoriteDestinations` (`ObjectId[]` ref `Destination`), `reviewCount` (`Number`, default 0).
- **Methods:** `comparePassword(candidate): Promise<boolean>`.
- **Hooks:** Pre-save hashes password when modified.

### 4.2 Destination (`src/models/Destination.model.ts`)
- **Collection:** `destinations`
- **Fields:** `name`, `slug` (auto-generated lowercase), `description`, `location: { city, state?, country: ObjectId ref Country }`, `category` (enum), `imageUrls` (`String[]`), `attractions` (`IAttraction[]` subdocuments), `bestTimeToVisit`, `travelTips` (`String[]`), `travelTipsContextHash`, `aiReviewSummary`, `summaryGeneratedAtRatingCount`, `reviewContentVersion`, `searchCity` (normalized prefix search field), `openingHours`, `ticketPrice`, `website`, `averageRating` (0-5, aggregated), `ratingsCount` (aggregated), `isFeatured` (`Boolean`).
- **Attraction Subdocument (`IAttraction`):** `name` (required), `description`, `ticketPrice`, `suggestedDuration`, `openingHours`, `category` (from `ATTRACTION_CATEGORIES`).
- **Indexes:**
  - Compound Unique: `{ "location.country": 1, slug: 1 }` (Canonical lookup key).
  - Listing & Sorting: `{ createdAt: -1, _id: -1 }`, `{ category: 1, createdAt: -1, _id: -1 }`, `{ "location.country": 1, createdAt: -1, _id: -1 }`.
  - Ratings: `{ category: 1, averageRating: -1, _id: 1 }`, `{ averageRating: -1, _id: 1 }`.
  - Search: `{ searchCity: 1 }`, `{ name: "text", description: "text", "location.city": "text" }`.
- **Hooks:** Pre-validate generates `slug` and `searchCity`. Pre-findOneAndUpdate updates `slug` and `searchCity` when name/city changes.

### 4.3 Country (`src/models/Country.model.ts`)
- **Collection:** `countries`
- **Fields:** `name`, `searchName` (hidden normalized field), `slug` (unique, lowercase), `imageUrl`, `description`, `continent` (`ObjectId` ref `Continent`).
- **Virtuals:** `destinations` (populates destinations where `location.country === _id`).
- **Indexes:** `{ continent: 1 }`, `{ searchName: 1 }`, `{ name: "text" }`.

### 4.4 Continent (`src/models/Continent.model.ts`)
- **Collection:** `continents`
- **Fields:** `name` (unique), `slug` (unique, lowercase), `description`, `imageUrl`.
- **Virtuals:** `countries` (populates countries where `continent === _id`).

### 4.5 Review (`src/models/Review.model.ts`)
- **Collection:** `reviews`
- **Fields:** `destination` (`ObjectId` ref `Destination`), `user` (`ObjectId` ref `User` or `null` for anonymous/deleted user reviews), `authorName`, `rating` (1-5), `reviewText` (max 500), `sentiment` (`"positive" | "neutral" | "negative"`), `themes` (`String[]`).
- **Indexes:**
  - Unique per user: `{ destination: 1, user: 1 }` with `partialFilterExpression: { user: { $type: "objectId" } }`.
  - Sorting: `{ destination: 1, createdAt: -1 }`.
- **Hooks:** Post-save and post-findOneAndDelete recalculate `averageRating` and `ratingsCount` on the destination.

---

## 5. API Route Map

All routes are mounted under `/api` in `src/app.ts`, with root health probes at `/health`.

### 5.1 Authentication — `/api/auth`
| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| POST | `/register` | Public | `authLimiter` (10/15m) | Register new user via `registerSchema` |
| POST | `/login` | Public | `authLimiter` (10/15m) | Login user via `loginSchema` |
| POST | `/logout` | Public | None | Clears `token` HTTP-only cookie |
| GET | `/google` | Public | None | Initiates Google OAuth2 consent |
| GET | `/google/callback` | Public | None | Issues JWT cookie & redirects to `${CLIENT_URL}/oauth-success` |
| GET | `/github` | Public | None | Initiates GitHub OAuth2 consent |
| GET | `/github/callback` | Public | None | Issues JWT cookie & redirects to `${CLIENT_URL}/oauth-success` |

### 5.2 Users — `/api/users`
All user routes require `protect`.
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/profile` | `protect` | Returns current user profile (password excluded) |
| PATCH | `/profile` | `protect` | Updates profile details via `updateProfileSchema` |
| DELETE | `/profile` | `protect` | Anonymizes user reviews & deletes account |
| GET | `/favorites` | `protect` | Paginated list of favorited destinations |
| POST | `/favorites/:destinationId` | `protect` | Adds destination to user's favorites |
| DELETE | `/favorites/:destinationId` | `protect` | Removes destination from user's favorites |
| GET | `/reviews` | `protect` | Paginated list of reviews authored by the user |

### 5.3 Destinations — `/api/destinations`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Public | Paginated catalog (`page`, `limit`, `q`, `location`, `category`, `minRating`). Cached. |
| GET | `/search` | Public | Full-text search (?q=..., min 2 chars). Not cached. |
| GET | `/location/:location` | Public | Filter by city or country name |
| GET | `/category/:category` | Public | Filter by destination category |
| GET | `/continents` | Public | Aggregate stats for all continents (Cached 30m) |
| GET | `/continents/:continent/countries` | Public | Country stats for a continent (Cached 30m) |
| GET | `/:name` | Public | Fallback single destination lookup by name, slug, or ID |
| POST | `/` | `protect`, `restrictTo("admin")` | Create destination (Multer `images` max 5) |
| PUT | `/:id` | `protect`, `restrictTo("admin")` | Update destination (Multer `images` max 5) |
| DELETE | `/:id` | `protect`, `restrictTo("admin")` | Transactional delete with review cleanup & cache eviction |

### 5.4 Canonical Hierarchy Routes (Mounted on `app`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/countries/:countrySlug/destinations` | Public | Destinations belonging to a specific country |
| GET | `/api/countries/:countrySlug/destinations/:destinationSlug` | Public | Canonical destination detail (Cached 10m) |
| GET | `/api/countries/:countrySlug/destinations/:destinationSlug/reviews` | Public | Paginated destination reviews |
| POST | `/api/countries/:countrySlug/destinations/:destinationSlug/reviews` | `protect`, `restrictTo("user")` | Add review (Users only, triggers sentiment AI) |

### 5.5 Standalone Reviews — `/api/reviews`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| PATCH | `/:reviewId` | `protect`, `restrictTo("user")` | Update own review (re-runs sentiment analysis) |
| DELETE | `/:reviewId` | `protect` | Delete review (owner or admin) |

### 5.6 Admin Catalog Routes — `/api/admin`
All admin catalog routes are strictly protected by `protect, restrictTo("admin")`.
| Method | Endpoint | Upload | Description |
|--------|----------|--------|-------------|
| GET | `/continents` | None | Admin continent list with counts (Cached 5m) |
| GET | `/continents/:slug` | None | Single continent detail |
| POST | `/continents` | `image` (single) | Create continent |
| PUT | `/continents/:id` | `image` (single) | Update continent |
| DELETE | `/continents/:id` | None | Transactional delete (fails if countries exist) |
| GET | `/continents/:continentId/countries` | None | List countries in a continent |
| GET | `/continents/:continentId/countries/:slug` | None | Single country in a continent |
| POST | `/continents/:continentId/countries` | `image` (single) | Create country under a continent |
| PUT | `/countries/:id` | `image` (single) | Update country |
| DELETE | `/countries/:id` | None | Transactional delete (fails if destinations exist) |

### 5.7 AI Endpoints — `/api/ai`
| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| GET | `/destinations/:destinationId/summary` | Public | `aiLimiter` (20/m) | AI review summary (cached/regenerated when eligible) |
| POST | `/destinations/:destinationId/summary/regenerate` | `protect`, `admin` | None | Force regenerate review summary |
| GET | `/destinations/:destinationId/tips` | Public | `aiLimiter` (20/m) | AI travel tips (grounded in context hash) |
| POST | `/destinations/:destinationId/tips/regenerate` | `protect`, `admin` | None | Force regenerate travel tips |

### 5.8 AI Agents — `/api/ai/agents`
Mounted **before** `/api/ai`. Both endpoints require authentication.
| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| POST | `/plan-itinerary` | `protect` | `agentLimiter` (5/m) | Multi-day itinerary generation with tool grounding |
| POST | `/compare` | `protect` | `agentLimiter` (5/m) | 2–3 destination comparative analysis |

### 5.9 Health Probes
- `GET /health` and `GET /api/health` return HTTP 200 (`"healthy"` / `"degraded"`) or 503 (`"unhealthy"`), inspecting MongoDB and Redis states.

---

## 6. Architecture & Services Breakdown

The service layer contains pure business logic and does not touch Express `req` or `res` objects:

1. **`destination.service.ts`**: Unified facade delegating to:
   - `destination-query.service.ts`: Query compilation, full-text search, regex escaping, pagination metadata.
   - `destination-mutation.service.ts`: Multipart uploads to Cloudinary, database persistence, transactional deletion (`withMongoTransaction`).
   - `destination-stats.service.ts`: MongoDB aggregation pipelines for continent and country statistics.
2. **`agent.service.ts`**: Runs the Vercel AI SDK `ToolLoopAgent` using Gemini. Enforces query bounds (1-30 days, 1-20 travellers, 2-3 destinations for comparisons).
3. **`agent-grounding.service.ts`**: Post-processing filter verifying that every activity in an AI itinerary strictly matches an existing item in the destination's `attractions` array.
4. **`budget-calculation.service.ts`**: Realistic budget engine combining destination local rates, travel styles (`budget`, `moderate`, `luxury`), intercity transit multipliers, and currency conversion.
5. **`cost-profile.service.ts` & `country-cost-profiles.ts`**: Country-specific price tiers in local currencies (USD, EUR, JPY, GBP, etc.) converted to INR.
6. **`currency.service.ts`**: Currency parser, conversion rates to INR, and formatted representations.
7. **`agent-error.service.ts`**: Classifies SDK, quota, or step exhaustion errors into typed `AgentError` responses.
8. **`cloudinary.service.ts`**: Streams memory buffers to Cloudinary using `cloudinary.v2.uploader.upload_stream`.

---

## 7. Middleware & Utilities Reference

### 7.1 Error Handling (`src/middleware/error.middleware.ts`)
- **`AppError`**: Base operational error with `statusCode`, `status` ("fail" vs "error"), and `isOperational = true`.
- **`AgentError`**: Extends `AppError` with `code`, `context` (`{ agent, operation }`), and `retryable: boolean`. Formatted into a structured JSON envelope.
- **`globalErrorHandler`**: Converts `CastError`, `ValidationError`, Mongo duplicate key (11000), `ZodError`, `TokenExpiredError`, and `MulterError` into clean operational errors. In production, hides internal details for non-operational 500 errors.
- **`catchAsync` / `catchAsyncBody`**: Wraps async Express handlers and forwards rejected promises to `next(err)`.

### 7.2 Validation (`src/middleware/validation.middleware.ts`)
- **`validate(schema)`**: Middleware for `req.body`. On error, returns `400 { status: "fail", message, errors }`.
- **`parseQuery(schema)`**: Helper for route handlers to safely parse and type-cast `req.query`.

### 7.3 Authentication (`src/middleware/auth.middleware.ts`)
- **`protect`**: Reads JWT from `Authorization: Bearer <token>` or `req.cookies.token`. Attaches user document to `req.user`.
- **`restrictTo(...roles)`**: Asserts `req.user.role` matches required roles (e.g. `"admin"` or `"user"`).

### 7.4 Redis Caching (`src/utils/cache.ts`)
- **`withCache(key, ttl, fn)`**: Read-through caching with automatic fallback if Redis is down. If cache write fails, the result is still returned without throwing.
- **`invalidateKeys(...keys)`**: Deletes specific Redis keys.
- **`invalidatePattern(pattern)`**: Uses `scanIterator` to safely delete all keys matching a glob pattern (e.g. `api:dest:paginated:*`).

### 7.5 Database Transactions (`src/utils/mongo-transactions.ts`)
- **`withMongoTransaction(fn)`**: Manages a MongoDB `ClientSession` with `.withTransaction()`. If the deployment does not support replica set transactions, returns a clean 503 `AppError`.

### 7.6 Dynamic AI SDK Loading (`src/utils/ai-sdk.ts`)
- **`loadAiSdk()`**: Dynamic ESM import singleton. Prevents CommonJS / ESM runtime conflicts with the Vercel AI SDK.

---

## 8. Coding Conventions for AI Agents

1. **Controller Structure**: Always wrap handlers in `catchAsync(async (req, res) => { ... })`. Never send error responses manually inside controllers; throw an `AppError` or `AgentError`.
2. **Strict Separation of Concerns**: Controllers read HTTP requests and call services. Services perform database and business logic and **never** access Express `req`, `res`, or `next`.
3. **Id Validation**: Always check `isValidObjectId(id)` from `src/utils/validation.ts` before executing database queries with URL parameters.
4. **Zod Validation**: Define schemas in `src/validators/`. Export the schema and the TypeScript inferred type (`z.infer<typeof schema>`).
5. **Exact Optional Properties**: With `"exactOptionalPropertyTypes": true` in `tsconfig.json`, do not pass explicit `undefined` to optional fields. Use conditional spread: `...(val ? { field: val } : {})`.
6. **No Clamping in AI Prompts**: Prompts and services must strictly enforce bounds (e.g. max 30 days, max 20 travellers). Never silently clamp an invalid request; return `status: "invalid_request"`.
7. **Cache Invalidation**: On create, update, or delete operations, invalidate both exact detail keys and glob patterns (`DEST_LISTING_PATTERN`, `CONTINENT_AGG_PATTERN`).
8. **Cloudinary Uploads**: Never write files to disk. Multer keeps uploads in memory buffers; use `uploadImageStream(file.buffer, folder)`.

---

## 9. Common Commands

```bash
# Development
npm run dev           # Start backend with tsx watch on port 3000

# Building & Type Checking
npm run type-check    # Run tsc --noEmit (strict type checking)
npm run build         # Compile TypeScript to dist/
npm run start         # Run compiled production server from dist/index.js

# Code Quality
npm run lint          # Run ESLint on src/
npm run format        # Run Prettier write on all files
npm run format:check  # Check formatting

# Seeding
npm run seed -- --force   # Wipe & seed local database with sample fixtures
```

---

*Last revised: November 2026 — Verified against all active backend routes, services, models, and TypeScript configuration.*
