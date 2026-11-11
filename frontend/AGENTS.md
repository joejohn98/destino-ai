# Destino AI — Backend Codebase Context for AI Agents

> **Purpose:** This file is the authoritative reference for AI coding agents (Codex, Claude Code, OpenCode, Cursor, etc.) working on this codebase. Read it fully before generating any code, suggesting edits, or answering questions about the project. Do **not** invent details not found here.

---

## 1. Project Identity

| Field | Value |
|-------|-------|
| Name | `destino-backend` |
| Runtime | Node.js (CommonJS — `"type": "commonjs"` in package.json) |
| Language | TypeScript 5.x |
| Framework | **Express.js v5** (`^5.2.1`) |
| Database | MongoDB via **Mongoose 9** |
| Cache | **Redis 6** (using the `redis` npm package v6) |
| AI SDK | **Vercel AI SDK** (`ai@^7`) + `@ai-sdk/google` for Gemini |
| Auth | JWT (cookie + Bearer) + Passport.js (Google OAuth2, GitHub OAuth2) |
| Validation | **Zod v4** throughout |
| File Uploads | **Multer v2** (memory storage) → streamed to **Cloudinary v2** |
| Dev runner | `tsx watch` (no `ts-node`, no `nodemon`) |
| Build | `tsc` → `dist/` |
| Package manager | npm |

---

## 2. Directory Structure (Exact)

```
backend/
├── src/
│   ├── index.ts              ← process entry, graceful shutdown, server bootstrap
│   ├── app.ts                ← Express app factory, middleware stack, route mounts
│   ├── seed.ts               ← standalone DB seed script (run via: npm run seed)
│   │
│   ├── config/
│   │   ├── config.ts         ← centralised env var access (dotenv.config here)
│   │   ├── db.ts             ← Mongoose connect/disconnect
│   │   ├── redis.ts          ← Redis client creation, connect/disconnect helpers
│   │   ├── passport.ts       ← Passport Google + GitHub strategies
│   │   └── cloudinary.ts     ← Cloudinary SDK configuration
│   │
│   ├── models/
│   │   ├── index.ts          ← barrel re-export of all models
│   │   ├── User.model.ts
│   │   ├── Destination.model.ts
│   │   ├── Country.model.ts
│   │   ├── Continent.model.ts
│   │   └── Review.model.ts
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── destination.controller.ts
│   │   ├── continent.controller.ts
│   │   ├── country.controller.ts
│   │   ├── review.controller.ts
│   │   ├── ai.controller.ts
│   │   └── agent.controller.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── destination.service.ts
│   │   ├── continent.service.ts
│   │   ├── country.service.ts
│   │   ├── review.service.ts
│   │   ├── ai.service.ts
│   │   ├── agent.service.ts
│   │   ├── agent-grounding.service.ts
│   │   └── cloudinary.service.ts
│   │
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── destination.routes.ts
│   │   ├── continent.routes.ts
│   │   ├── country.routes.ts
│   │   ├── review.routes.ts
│   │   ├── ai.routes.ts
│   │   └── agent.routes.ts
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts       ← protect(), restrictTo()
│   │   ├── error.middleware.ts      ← globalErrorHandler, notFoundHandler
│   │   ├── validation.middleware.ts ← validate(zodSchema) → RequestHandler
│   │   ├── upload.middleware.ts     ← uploadSingle(), uploadArray() via Multer
│   │   └── ratelimit.middleware.ts  ← agentLimiter, authLimiter
│   │
│   ├── validators/
│   │   ├── auth.validators.ts
│   │   ├── user.validators.ts
│   │   ├── destination.validators.ts
│   │   ├── continent.validators.ts
│   │   ├── country.validators.ts
│   │   ├── review.validators.ts
│   │   └── ai.validators.ts
│   │
│   ├── agents/
│   │   ├── planner.agent.ts     ← itinerary agent: system prompt, tools, Zod output schema
│   │   └── comparison.agent.ts  ← comparison agent: system prompt, tools, Zod output schema
│   │
│   ├── tools/
│   │   ├── destination.tools.ts ← searchDestinations, getDestinationDetails
│   │   ├── review.tools.ts      ← getDestinationReviews
│   │   └── budget.tools.ts      ← estimateTripBudget
│   │
│   ├── utils/
│   │   ├── AppError.ts          ← custom Error class
│   │   ├── catchAsync.ts        ← async RequestHandler wrapper
│   │   ├── cache.ts             ← withCache(), invalidateKeys()
│   │   ├── utils.ts             ← createSendToken(), generateToken()
│   │   ├── ai-sdk.ts            ← lazy singleton ESM loader for the AI SDK
│   │   └── validation.ts        ← isValidObjectId()
│   │
│   └── scripts/
│       └── seed.ts              ← (NOTE: package.json "seed" script points to src/seed.ts, not here)
│
├── dist/                        ← compiled output (gitignored)
├── package.json
├── tsconfig.json
├── .env                         ← real secrets (gitignored)
└── .env.example                 ← currently empty — must be populated
```

---

## 3. Environment Variables (All Required Unless Marked Optional)

Read exclusively from `src/config/config.ts` (which calls `dotenv.config()`).
**Exception (known bug):** `src/config/redis.ts` reads `process.env.REDIS_URL` directly.
**Exception (known bug):** `src/config/passport.ts` reads OAuth vars directly from `process.env` with `!` non-null assertions.

```
PORT                          # default: 3000
NODE_ENV                      # "development" | "production"
DATABASE_URL                  # MongoDB connection string (required)
JWT_SECRET                    # min 32 chars (required)
JWT_EXPIRATION                # e.g. "7d" (required; cookie maxAge is hardcoded 7d — known bug)
REDIS_URL                     # default: redis://localhost:6379
GOOGLE_GENERATIVE_AI_API_KEY  # Gemini API key (required for AI features)
CLIENT_URL                    # e.g. http://localhost:5173 (CORS / OAuth redirect base)
CLOUDINARY_CLOUD_NAME         # required for image uploads
CLOUDINARY_API_KEY            # required for image uploads
CLOUDINARY_API_SECRET         # required for image uploads
GOOGLE_CLIENT_ID              # OAuth (required for Google login)
GOOGLE_CLIENT_SECRET          # OAuth (required for Google login)
GOOGLE_CALLBACK_URL           # OAuth (required for Google login)
GITHUB_CLIENT_ID              # OAuth (required for GitHub login)
GITHUB_CLIENT_SECRET          # OAuth (required for GitHub login)
GITHUB_CALLBACK_URL           # OAuth (required for GitHub login)
```

---

## 4. MongoDB Data Models

### 4.1 User (`src/models/User.model.ts`)

**Collection:** `users` | **Interface:** `IUser extends Document`

| Field | Type | Notes |
|-------|------|-------|
| `firstName` | `String` | required, trim |
| `lastName` | `String` | required, trim |
| `username` | `String` | required, unique, min 3, max 30 |
| `email` | `String` | required, unique, lowercase |
| `password` | `String` | optional (not required when `authProviders` populated), `select: false`, bcrypt hashed on save |
| `authProviders` | `[{ provider, providerId }]` | `provider` in `["google", "github"]` |
| `role` | `String` | `"user"` or `"admin"`, default `"user"` |
| `avatarUrl` | `String?` | optional |
| `bio` | `String?` | max 500 chars |
| `favoriteDestinations` | `ObjectId[]` | ref `Destination` |
| `createdAt`, `updatedAt` | `Date` | timestamps |

**Indexes:**
- `{ "authProviders.provider": 1, "authProviders.providerId": 1 }` — unique, sparse

**Instance method:** `comparePassword(candidatePassword): Promise<boolean>`
**Pre-save hook:** Hashes `password` with bcrypt rounds=12 when modified.

---

### 4.2 Destination (`src/models/Destination.model.ts`)

**Collection:** `destinations` | **Interface:** `IDestination extends Document`

| Field | Type | Notes |
|-------|------|-------|
| `name` | `String` | required |
| `slug` | `String` | required, lowercase; auto-generated from `name` via slugify |
| `description` | `String` | required |
| `location.city` | `String` | required |
| `location.state` | `String?` | optional |
| `location.country` | `ObjectId` | ref `Country`, required |
| `category` | `String` | enum — see CATEGORIES below |
| `imageUrls` | `String[]` | default `[]` |
| `attractions` | `IAttraction[]` | subdocuments with `_id: true` |
| `bestTimeToVisit` | `String?` | optional |
| `travelTips` | `String[]?` | AI-generated, optional |
| `travelTipsContextHash` | `String?` | SHA-256 of context; used to skip tip regeneration |
| `aiReviewSummary` | `String?` | AI-generated review summary |
| `summaryGeneratedAtRatingCount` | `Number?` | ratingsCount when summary was last generated |
| `openingHours` | `String?` | optional |
| `ticketPrice` | `String?` | optional |
| `website` | `String?` | optional |
| `averageRating` | `Number` | default 0, range 0-5; updated by Review model hooks |
| `ratingsCount` | `Number` | default 0; updated by Review model hooks |
| `isFeatured` | `Boolean` | default false |
| `createdAt`, `updatedAt` | `Date` | timestamps |

**Indexes:**
- `{ category: 1 }`
- `{ averageRating: -1 }`
- `{ "location.country": 1, slug: 1 }` — **UNIQUE** (canonical lookup key)
- `{ name: "text", description: "text" }` — text search index (not currently used by search endpoint — known bug)

**IAttraction subdocument fields:** `name` (required), `description?`, `ticketPrice?`, `suggestedDuration?`, `openingHours?`, `category?` (enum ATTRACTION_CATEGORIES)

**Exported constants (used in validators and tools):**
```ts
CATEGORIES = ["beach","mountain","city","historical","adventure","wildlife"] as const
ATTRACTION_CATEGORIES = ["monument","museum","market","nature","viewpoint","day-trip","activity","religious","entertainment"] as const
SENTIMENTS = ["positive","neutral","negative"] as const
```

**Pre-validate hook:** Auto-generates `slug` from `name` via `slugify({ lower: true, strict: true })`.
**Pre-findOneAndUpdate hook:** Regenerates `slug` if `name` or `$set.name` is updated.

---

### 4.3 Country (`src/models/Country.model.ts`)

**Collection:** `countries` | **Interface:** `ICountry extends Document`

| Field | Type | Notes |
|-------|------|-------|
| `name` | `String` | required, trim |
| `slug` | `String` | required, unique, lowercase; auto-generated from name |
| `imageUrl` | `String` | required |
| `description` | `String?` | optional |
| `continent` | `ObjectId` | ref `Continent`, required |

**Virtual:** `destinations` — populates `Destination` docs where `location.country == _id`
**Index:** `{ continent: 1 }`
**Slug hooks:** Same pattern as Destination model.

---

### 4.4 Continent (`src/models/Continent.model.ts`)

**Collection:** `continents` | **Interface:** `IContinent extends Document`

| Field | Type | Notes |
|-------|------|-------|
| `name` | `String` | required, unique |
| `slug` | `String` | required, unique, lowercase; auto-generated from name |
| `description` | `String?` | optional |
| `imageUrl` | `String` | required |

**Virtual:** `countries` — populates `Country` docs where `continent == _id`
**Slug hook:** Same pre-validate pattern as Destination.

---

### 4.5 Review (`src/models/Review.model.ts`)

**Collection:** `reviews` | **Interface:** `IReview extends Document`

| Field | Type | Notes |
|-------|------|-------|
| `destination` | `ObjectId` | ref `Destination`, required |
| `user` | `ObjectId or null` | ref `User`, default `null` (anonymous allowed) |
| `authorName` | `String` | required, default `"Anonymous"` |
| `rating` | `Number` | required, min 1, max 5 |
| `reviewText` | `String` | required, max 500 chars |
| `sentiment` | `String?` | `"positive"`, `"neutral"`, or `"negative"` |
| `themes` | `String[]` | default `[]` |
| `createdAt`, `updatedAt` | `Date` | timestamps |

**Indexes:**
- `{ destination: 1, user: 1 }` — unique with `partialFilterExpression: { user: { $type: "objectId" } }` (one review per user per destination; multiple anonymous reviews allowed)
- `{ destination: 1, createdAt: -1 }`

**Post-save hook:** Calls `refreshDestinationRatings(review.destination)` — recalculates `averageRating` and `ratingsCount` on the parent Destination via aggregation.
**Post-findOneAndDelete hook:** Same refresh call.
**CRITICAL:** `deleteMany()` does NOT trigger these hooks — `averageRating` will NOT be updated if reviews are bulk-deleted.

---

## 5. API Route Map

Base URL: `/api`

### Auth — `/api/auth`
| Method | Path | Auth | Rate Limit | Notes |
|--------|------|------|-----------|-------|
| POST | `/register` | None | authLimiter (10/15min) | Zod: registerSchema |
| POST | `/login` | None | authLimiter | Zod: loginSchema |
| POST | `/logout` | None | None | Clears cookie |
| GET | `/google` | None | None | Passport Google redirect |
| GET | `/google/callback` | None | None | Sets JWT cookie, redirects to clientUrl/oauth-success |
| GET | `/github` | None | None | Passport GitHub redirect |
| GET | `/github/callback` | None | None | Sets JWT cookie, redirects to clientUrl/oauth-success |

### Users — `/api/users`
All routes guarded by `router.use(protect)`.

| Method | Path | Zod Schema |
|--------|------|-----------|
| GET | `/profile` | — |
| PATCH | `/profile` | updateProfileSchema |
| DELETE | `/profile` | — |

### Destinations — `/api/destinations`
| Method | Path | Auth | Upload | Notes |
|--------|------|------|--------|-------|
| GET | `/` | None | — | ?page=1&limit=12; cached per page+limit |
| GET | `/search` | None | — | ?q=... (min 2 chars); NOT cached |
| GET | `/rating` | None | — | All docs sorted by rating DESC; NO pagination (known bug) |
| GET | `/location/:location` | None | — | Filter by city/country; NO limit (known bug) |
| GET | `/filter/:minRating` | None | — | Filter by min rating; NO limit (known bug) |
| GET | `/category/:category` | None | — | Filter by category; NO limit (known bug) |
| GET | `/continents` | None | — | Aggregation stats; cached 30min |
| GET | `/continents/:continent/countries` | None | — | Country stats per continent; cached 30min |
| GET | `/:name` | None | — | Legacy name/slug lookup; NOT cached; registered LAST |
| POST | `/` | JWT + admin | images[] (max 5) | createDestinationSchema |
| PUT | `/:id` | JWT + admin | images[] (max 5) | updateDestinationSchema |
| DELETE | `/:id` | JWT + admin | — | Cascade-deletes associated reviews |

### Canonical Destination Detail (mounted directly on `app`, not on the destinations router)
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/countries/:countrySlug/destinations/:destinationSlug` | None | Cached 10min. Uses compound unique index `{location.country, slug}`. |

### Reviews
**Nested (uses mergeParams: true):**
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/countries/:countrySlug/destinations/:destinationSlug/reviews` | None | |
| POST | `/api/countries/:countrySlug/destinations/:destinationSlug/reviews` | JWT + restrictTo("user") | Admins CANNOT post reviews |

**Standalone:**
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| PATCH | `/api/reviews/:reviewId` | JWT + restrictTo("user") | updateReviewSchema |
| DELETE | `/api/reviews/:reviewId` | JWT | Owner or admin can delete |

### Admin — Continents — `/api/admin/continents`
**WARNING: No auth guard at route mount in app.ts — known critical security bug.**

| Method | Path | Upload |
|--------|------|--------|
| GET | `/` | — |
| GET | `/:slug` | — |
| POST | `/` | image (single, field name: `image`) |
| PUT | `/:id` | image (single) |
| DELETE | `/:id` | — |

### Admin — Countries — `/api/admin/continents/:continentId/countries` and `/api/admin/countries`
**WARNING: No auth guard at route mount — same critical security bug.**

| Method | Path | Router | Upload |
|--------|------|--------|--------|
| GET | `/` | continentCountryRoutes | — |
| GET | `/:slug` | continentCountryRoutes | — |
| POST | `/` | continentCountryRoutes | image (single) |
| PUT | `/:id` | countryRoutes | image (single) |
| DELETE | `/:id` | countryRoutes | — |

### AI — `/api/ai`
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/destinations/:destinationId/tips` | None | No rate limit (known bug) |
| GET | `/destinations/:destinationId/summary` | None | No rate limit (known bug) |
| POST | `/destinations/:destinationId/summary/regenerate` | JWT + admin | Force regenerate |

### AI Agents — `/api/ai/agents`
| Method | Path | Auth | Rate Limit |
|--------|------|------|-----------|
| POST | `/plan-itinerary` | None | agentLimiter (5 req/min/IP, in-memory) |
| POST | `/compare` | None | agentLimiter (5 req/min/IP, in-memory) |

**Route mount order in app.ts:**
```ts
app.use("/api/ai", aiRoutes);           // mounted BEFORE agents (known bug — should be after)
app.use("/api/ai/agents", agentRoutes); // should be mounted first
```

---

## 6. Middleware Stack (Applied in Order in app.ts)

```
cors({ credentials: true })              // WARNING: no origin whitelist — known security bug
morgan("combined" | "dev")               // HTTP request logging
express.json()                           // JSON body parsing
express.urlencoded({ extended: true })   // URL-encoded body parsing
cookieParser()                           // Cookie parsing (reads req.cookies.token)
passport.initialize()                    // Passport — session: false everywhere
... all route handlers ...
notFoundHandler                          // Returns 404 for unmatched routes
globalErrorHandler                       // Centralized error normalizer + responder
```

---

## 7. Key Utilities and Patterns

### `catchAsync(fn)` — `src/utils/catchAsync.ts`
Wraps an async `RequestHandler`. Thrown errors are forwarded to `next()`.
Every controller handler is wrapped with `catchAsync`.

```ts
export const myHandler: RequestHandler = catchAsync(async (req, res) => {
  // throw new AppError("msg", 404) or let service throw — reaches globalErrorHandler
});
```

### `AppError` — `src/utils/AppError.ts`
Custom error class extending `Error`.
Fields: `statusCode: number`, `status: "fail" | "error"` (4xx = "fail", 5xx = "error"), `isOperational: true`, `cause?: unknown`.

```ts
throw new AppError("Not found", 404);
throw new AppError("Internal error", 500, originalError);
```

### `validate(schema)` — `src/middleware/validation.middleware.ts`
Returns a `RequestHandler`. Runs `schema.safeParse(req.body)`.
On failure: responds `400 { status: "fail", message, errors }` — does not call `next()`.
On success: replaces `req.body` with the parsed/coerced Zod output.

### `protect` — `src/middleware/auth.middleware.ts`
Reads JWT from `Authorization: Bearer <token>` header OR `req.cookies.token`.
Verifies JWT, fetches `User` from DB, attaches to `req.user: IUser`.
Throws `AppError` 401 on any failure.

### `restrictTo(...roles: string[])` — `src/middleware/auth.middleware.ts`
Checks `req.user.role` against allowed roles array.
Returns `AppError` 403 if not in list.

### `withCache<T>(key, ttlSeconds, fn)` — `src/utils/cache.ts`
Read-through Redis cache.
- Hit: returns `JSON.parse(cached)` immediately.
- Miss: calls `fn()`, stores result with `setEx`, returns result.
- Redis error: falls through to `fn()` (graceful degradation).
- Known bug: if `fn()` succeeds but `setEx` throws, catch block calls `fn()` a second time.

### `invalidateKeys(...keys)` — `src/utils/cache.ts`
Deletes exact Redis keys via `redisClient.del(keys)`. Failures silently swallowed.

### `loadAiSdk()` — `src/utils/ai-sdk.ts`
Lazy singleton. Dynamically imports the ESM-only `ai` and `@ai-sdk/google` packages exactly once.
Returns `{ ToolLoopAgent, Output, isStepCount, NoOutputGeneratedError, generateText, google }`.
**Must always be awaited — never top-level import the AI SDK directly (ESM/CJS incompatibility).**

### `uploadSingle(fieldName?)` / `uploadArray(fieldName?, maxCount?)` — `src/middleware/upload.middleware.ts`
Multer helpers. Memory storage. Max file size: 5 MB. Accepts only `image/*` MIME.
`req.file` (single) or `req.files: Express.Multer.File[]` (array) contain `{ buffer, mimetype, originalname, ... }`.

### `uploadImageStream(buffer, folder?)` / `uploadMultipleImageStreams(buffers, folder?)` — `src/services/cloudinary.service.ts`
Streams a `Buffer` to Cloudinary via `upload_stream`. Default folder: `"destino"`.
Returns `{ url: string, publicId: string }` or throws `AppError` 500 on failure.

### `isValidObjectId(id)` — `src/utils/validation.ts`
Wrapper around `mongoose.Types.ObjectId.isValid(id)`. Returns boolean.

### `createSendToken(user, res)` — `src/utils/utils.ts`
Signs JWT with `{ id: user._id }`. Sets `token` cookie (`httpOnly`, `secure` in prod, `sameSite: "none"` in prod / `"lax"` in dev, maxAge: hardcoded 7 days). Returns the token string.

---

## 8. Auth Flow Detail

### Local Registration
1. `POST /api/auth/register` with `{ firstName, lastName, username, email, password }`
2. `validate(registerSchema)` runs — passes data through Zod
3. `authService.register()` checks for existing email/username, creates `User`, saves (triggers bcrypt hook)
4. `createSendToken(user, res)` signs JWT, sets cookie
5. Returns `201 { status: "success", message, data: user }` (password stripped via `toObject()` destructuring)

### Local Login
1. `POST /api/auth/login` with `{ email, password }`
2. Finds user with `.select("+password")` (password excluded by default)
3. Calls `user.comparePassword(password)` (bcrypt.compare)
4. `createSendToken(user, res)` signs JWT, sets cookie
5. Returns `200 { status: "success", message, data: user }`

### OAuth (Google / GitHub)
1. GET `/api/auth/google` → Passport redirects to Google consent screen
2. GET `/api/auth/google/callback` → Passport calls `authService.findOrCreateSocialUser()`
3. `findOrCreateSocialUser` logic:
   - Find by `authProviders.provider + providerId` → return if found
   - Find by email → link new provider, save → return
   - Create new user with unique username (derived from email prefix, uniqueness ensured with counter loop)
4. `createSendToken(user, res)` sets cookie
5. `res.redirect(clientUrl/oauth-success)`

---

## 9. AI Features

### 9.1 Sentiment Analysis
**Function:** `aiService.analyzeSentiment(reviewText: string)`
**Model:** `google("gemini-3.5-flash-lite")` — **INVALID model ID (known bug; use `gemini-2.0-flash-lite` or `gemini-1.5-flash`)**
**Output Zod schema:** `{ sentiment: "positive"|"neutral"|"negative", themes: string[] }`
**Called by:** `review.service.createReview`
**Known bug:** Throws 500 on AI error — should degrade to neutral and save review anyway.

### 9.2 Travel Tips Generation
**Function:** `aiService.generateDestinationTips(destinationId: string)`
**Context hash:** SHA-256 of `{ name, category, city, country, bestTimeToVisit }` stored in `travelTipsContextHash`. Tips are regenerated only when this hash changes.
**Optimistic save:** `findOneAndUpdate({ _id, updatedAt })` — skips save if document was modified by another process.
**Output:** `{ tips: string[] }` — saved to `Destination.travelTips`.

### 9.3 Review Summary Generation
**Function:** `aiService.generateDestinationSummary(destinationId, force?)`
**Minimum reviews:** 3 (returns `{ summary: null, message }` if fewer)
**Regeneration condition:** `force=true` OR no existing summary OR `ratingsCount - summaryGeneratedAtRatingCount >= 5`
**Input:** Last 100 reviews sorted by `createdAt DESC`
**Optimistic save:** `findOneAndUpdate({ _id, ratingsCount })` — skips if ratingsCount changed during generation.

### 9.4 Planner Agent
**Entry:** `POST /api/ai/agents/plan-itinerary` → `agentService.planItinerary(query)`
**System prompt:** `PLANNER_SYSTEM` in `src/agents/planner.agent.ts`
**Tools available:** `searchDestinations`, `getDestinationReviews`, `estimateTripBudget`
**Tool call order:** `PLANNER_TOOL_ORDER = ["searchDestinations", "getDestinationReviews", "estimateTripBudget"]`
**Max steps:** 10 (`isStepCount(10)`)
**Input bounds (enforced at service and system prompt level):** max 30 days, max 20 travellers
**Output type:** `ItineraryOutput` (inferred from `itinerarySchema` Zod)
**Post-processing:** `enforceAttractionGrounding(output)` in `agent-grounding.service.ts` strips any activities not present in the destination's verified `attractions` array.

### 9.5 Comparison Agent
**Entry:** `POST /api/ai/agents/compare` → `agentService.compareDestinations(query)`
**System prompt:** `COMPARISON_SYSTEM` in `src/agents/comparison.agent.ts`
**Tools available:** `searchDestinations`, `getDestinationDetails`, `getDestinationReviews`
**Tool call order:** `COMPARISON_TOOLS_ORDER = ["searchDestinations", "getDestinationDetails", "getDestinationReviews"]`
**Max steps:** 10
**Bounds:** 2–3 destinations only
**Output type:** `ComparisonOutput` (from `comparisonSchema` Zod)
**Post-processing:** `validateAndEnforceComparisonGrounding(output)` validates recommendation matches a researched destination name.

---

## 10. Agent Tool Definitions

All tools in `src/tools/` are plain objects:
```ts
{ description: string, inputSchema: ZodObject, execute: async (input) => result }
```
They return plain objects (NOT AppError — they catch internally and return `{ error: string }`).

| Tool | File | Input Fields |
|------|------|-------------|
| `searchDestinations` | destination.tools.ts | `query` (min 2), `category?`, `location?`, `minRating?`, `maxResults?` (default 5, max 10) |
| `getDestinationDetails` | destination.tools.ts | `destinationId` (ObjectId string) |
| `getDestinationReviews` | review.tools.ts | `destinationIds[]` (1-3), `maxReviewsPerDestination?` (default 10) |
| `estimateTripBudget` | budget.tools.ts | `destinationIds[]`, `durationDays` (1-30), `travellers` (1-20), `travelStyle`, `budgetLimit?` (INR) |

**Budget daily rates per person (INR):**

| Style | Accommodation | Food | Local Transport | Activities | Intercity |
|-------|--------------|------|----------------|------------|----------|
| budget | 800 | 700 | 300 | 500 | 1500 |
| moderate | 1800 | 1400 | 700 | 1200 | 2500 |
| luxury | 5000 | 3500 | 1800 | 3500 | 6000 |

Intercity total = `(destinations.length - 1) * rate.intercityTransport * travellers`.

---

## 11. Redis Cache Keys Catalog

Defined inside `src/services/destination.service.ts` as local constant `CACHE_KEYS` (not exported).

| Key Pattern | TTL | Invalidated by |
|-------------|-----|----------------|
| `agg:continent:stats` | 30 min | Any destination/country/continent write |
| `agg:continent:{slug}:countries` | 30 min | Same |
| `api:dest:paginated:p{n}:l{n}` | 3 min | Destination create/update/delete (only p1 variants are cleared — known bug) |
| `api:dest:slug:{countrySlug}:{destSlug}` | 10 min | Destination update/delete |

**Known bug:** `continent.service.ts` and `country.service.ts` hardcode `"agg:continent:stats"` as a string literal instead of referencing the constant — works currently but fragile.

---

## 12. Error Handling Contract

### `globalErrorHandler` normalizes errors to `AppError`:

| Error Type | Status Code |
|------------|------------|
| `mongoose.Error.CastError` | 400 |
| `mongoose.Error.ValidationError` | 400 |
| `MongoServerError` (code 11000, duplicate key) | 409 |
| `ZodError` | 400 |
| `jwt.TokenExpiredError` | 401 |
| `jwt.JsonWebTokenError` | 401 |
| `MulterError LIMIT_FILE_SIZE` | 400 |
| Other `MulterError` | 400 |
| Everything else | 500 (non-operational) |

### Standard response shapes

**Success:**
```json
{ "status": "success", "data": {} }
{ "status": "success", "message": "...", "data": {} }
{ "status": "success", "results": 12, "data": [] }
```

**Client error (4xx):**
```json
{ "status": "fail", "message": "..." }
```

**Server error (5xx production):**
```json
{ "status": "error", "message": "Something went wrong. Please try again later." }
```

**Validation error (from validate() middleware):**
```json
{ "status": "fail", "message": "<first issue message>", "errors": { "fieldName": ["msg"] } }
```

**Development errors include:** `error` (serialized), `stack`.

---

## 13. TypeScript Configuration Highlights (`tsconfig.json`)

| Option | Value | Impact |
|--------|-------|--------|
| `module` | `node16` | CommonJS modules with proper ESM interop |
| `moduleResolution` | `node16` | Required to match `module` |
| `target` | `es2022` | |
| `strict` | `true` | All strict checks on |
| `noUncheckedIndexedAccess` | `true` | Array/object indexed access returns `T or undefined` |
| `exactOptionalPropertyTypes` | `true` | Cannot assign `undefined` to optional properties explicitly |
| `types` | `[]` | **KNOWN BUG: disables all @types/* including @types/node** |
| `isolatedModules` | `true` | Each file treated as standalone module |
| `skipLibCheck` | `true` | Skips .d.ts type checking |
| `noImplicitReturns` | commented out | Not enforced |
| `noUnusedLocals` | commented out | Not enforced |

---

## 14. Validation Schemas Reference

### `registerSchema` (auth.validators.ts)
`{ firstName, lastName, username(3-30), email, password(8-30), role: literal("user") default "user" }`

### `loginSchema` (auth.validators.ts)
`{ email, password(min 8) }`

### `updateProfileSchema` (user.validators.ts)
`{ firstName?, lastName?, email? }` — `.strict()`, at least one field required via `.refine()`

### `createDestinationSchema` (destination.validators.ts)
```
{
  name(2-100), description(10-2000),
  location: { city(min 1), state?, country(min 1) },
  continent(min 1),   ← ACCEPTED but IGNORED by service (known bug)
  category: CATEGORIES enum,
  bestTimeToVisit?,
  images?: z.url()[], ← existing Cloudinary URLs; uploaded file URLs added in controller
  attractions?: [{name(2-200), description?, ticketPrice?, suggestedDuration?, openingHours?, category?: ATTRACTION_CATEGORIES}]
}
```

### `updateDestinationSchema` (destination.validators.ts)
All same fields as create but all optional. No `continent` field.

### `createReviewSchema` (review.validators.ts)
`{ rating: coerce.number(1-5), reviewText(1-500) }`

### `updateReviewSchema` (review.validators.ts)
`{ rating?: coerce.number(1-5), reviewText?(1-500) }` — at least one required via `.refine()`

### `createContinentSchema` / `updateContinentSchema` (continent.validators.ts)
`{ name(min 1), description?, imageUrl? }` — imageUrl optional in Zod; controller enforces required

### `createCountrySchema` / `updateCountrySchema` (country.validators.ts)
Same structure as continent validators.

### `planRequestSchema` / `compareRequestSchema` (ai.validators.ts)
`{ query: string(10-500) }`

---

## 15. Known Bugs — Do Not Repeat These Patterns

| ID | Severity | Summary |
|----|----------|---------|
| **SEC-03** | CRITICAL | Admin routes (`/api/admin/*`) have no `protect` or `restrictTo("admin")` guard |
| **SEC-01** | CRITICAL | `cors({ credentials: true })` with no `origin` whitelist |
| **SEC-02** | CRITICAL | OAuth env vars use `!` non-null assertions, bypass `config.ts` validation |
| **CRASH-05** | CRITICAL | `google("gemini-3.5-flash-lite")` is an invalid model name — all AI calls fail |
| **CRASH-01** | CRITICAL | `redis.ts` reads `process.env.REDIS_URL` directly, bypassing `config.ts` and dotenv |
| **CRASH-03** | HIGH | `createReview` throws 500 on AI sentiment failure — review is NOT saved |
| **CRASH-04** | HIGH | `updateReview` does not re-run sentiment analysis when `reviewText` changes |
| **SEC-04** | HIGH | Cookie `maxAge` hardcoded to 7 days regardless of `JWT_EXPIRATION` env var |
| **SEC-05** | HIGH | Rate limiters use in-memory store — bypassed in multi-process deployments |
| **BUG-02** | HIGH | `getDestinationsByRating`, `getDestinationsByLocation`, etc. have no `.limit()` |
| **BUG-03** | MED | Search uses regex scan instead of `$text` operator — ignores text index |
| **BUG-04** | MED | Cache invalidation only clears page 1 variants of paginated keys |
| **BUG-06** | MED | `compareDestinations` 422 response missing `status` and `message` fields |
| **BUG-07** | MED | `continent.service` uses string literal `"agg:continent:stats"` not a constant |
| **TYPE-01** | MED | `config.ts` uses `as string` casts — env vars can silently be `undefined` |
| **TYPE-04** | MED | `"types": []` in tsconfig disables all `@types/*` |
| **QUAL-01** | MED | `auth.service` accepts `Response` object — violates SRP, untestable |
| **QUAL-03** | MED | Cascade deletes in continent/country services are not wrapped in transactions |
| **QUAL-04** | LOW | `escapeRegex` is duplicated in destination.service.ts and destination.tools.ts |
| **PERF-01** | MED | `getAllContinents` uses deep nested virtual populate — N+1 DB query risk |
| **PERF-02** | MED | AI tip/summary GET endpoints have no rate limit |
| **PERF-03** | LOW | `withCache` calls `fn()` twice on Redis write error |
| **PERF-04** | MED | Mongoose connection pool not configured (default is 5 connections) |
| **API-01** | MED | `/api/ai` mounted before `/api/ai/agents` in app.ts — should be reversed |
| **API-03** | LOW | `continent` field in createDestinationSchema is silently ignored by service |
| **DX-03** | LOW | `package.json "seed"` script path is wrong (points to `src/scripts/seed.ts` not `src/seed.ts`) |

---

## 16. Coding Conventions — Follow These When Adding Code

1. **Every controller handler:** `export const handler: RequestHandler = catchAsync(async (req, res) => { ... })`
2. **Throw errors:** `throw new AppError(message, statusCode)` — never `res.status(...).json(...)` for errors inside catchAsync
3. **ObjectId validation:** Always call `isValidObjectId(id)` from `src/utils/validation.ts` before passing route params to services
4. **Service layer:** Services are pure async functions — they do NOT receive `req`, `res`, or `next`. Do not add Express dependencies to services.
5. **Validators:** Define in `src/validators/`. Export the schema AND the inferred type. Service function signatures use the inferred type.
6. **Cache keys:** Follow pattern `api:{resource}:{id}`, `api:{resource}:paginated:p{n}:l{n}`, `agg:{resource}:{stat}`
7. **Image uploads:** Multer stores in memory. Always stream to Cloudinary with `uploadImageStream(req.file.buffer, folder)`. Save returned `.url` to DB.
8. **Response shape:** All success responses include `status: "success"`. List responses include `results: number`. Match Section 12 patterns.
9. **Admin routes:** Any route that creates, updates, or deletes data must have `protect, restrictTo("admin")` applied.
10. **AI SDK import:** Always `const { generateText, google } = await loadAiSdk()`. Never top-level import from `"ai"` or `"@ai-sdk/google"`.
11. **Slugs:** Never set slugs manually. Pre-validate hooks auto-generate them from `name`. Do not include `slug` in create payloads.
12. **Password field:** `select: false` on User model. To read it in a query: `.select("+password")`.
13. **Soft deletes:** Do not exist in this codebase. All deletes are hard (permanent).
14. **Transactions:** Cascade deletes currently do not use transactions (known bug). When adding new cascade operations, add session/transaction support.
15. **Bulk delete hooks:** `deleteMany()` does NOT trigger Mongoose post hooks. If `refreshDestinationRatings` needs to run, use `findByIdAndDelete` in a loop or run the aggregation manually.

---

## 17. Package Scripts

```bash
npm run dev         # tsx watch src/index.ts — hot reload dev server
npm run build       # tsc — compile to dist/
npm run start       # node dist/index.js — production
npm run type-check  # tsc --noEmit — type check only
npm run seed        # tsx src/scripts/seed.ts ← WRONG PATH (bug); actual file: src/seed.ts
```

---

## 18. Dependencies Quick Reference

```
express@^5.2.1              Web framework (v5 — NOT v4)
mongoose@^9.10.2            MongoDB ODM
redis@^6.3.0                Redis client
zod@^4.6.5                  Schema validation
jsonwebtoken@^9.0.3         JWT
bcryptjs@^3.0.3             Password hashing
passport@^0.7.0             Auth middleware (session: false always)
passport-google-oauth20      Google OAuth2 strategy
passport-github2             GitHub OAuth2 strategy
cloudinary@^2.11.0          Image CDN (v2 API)
multer@^2.4.0               Multipart form-data (memory storage)
ai@^7.0.136                 Vercel AI SDK — ESM-only, loaded via dynamic import
@ai-sdk/google@^4.0.93      Gemini provider — ESM-only, loaded via dynamic import
slugify@^1.6.9              Slug generation
morgan@^1.12.1              HTTP request logging
cors@^2.8.6                 CORS headers
cookie-parser@^1.4.7        Cookie parsing
dotenv@^18.0.4              Env file loading
express-rate-limit@^8.7.1   Rate limiting (in-memory by default)

DevDependencies:
typescript@^5.9.3
tsx@^4.23.15                TypeScript execution without compile step
@types/node, @types/express, @types/bcryptjs, @types/cors,
@types/cookie-parser, @types/jsonwebtoken, @types/morgan,
@types/multer, @types/passport, @types/passport-github2,
@types/passport-google-oauth20
```

---

*This document was generated from full static analysis of every source file in the backend. Last updated: October 2026.*

