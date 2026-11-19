# Destino AI — Frontend Application

The frontend client for Destino AI is built with Next.js 16 (App Router) and React 19. It delivers a fast, responsive, and luxury editorial travel experience with server-side rendering, client state management, catalog discovery, interactive itinerary builders, and an administrative management portal.

---

## Tech Stack

- **Framework & Runtime:** Next.js 16 (`next@16.4.6`), React 19 (`react@19.3.0`, `react-dom@19.3.0`), TypeScript
- **Styling & Design System:** Tailwind CSS v4 (`@tailwindcss/turbopack`), Custom Editorial Theme (`bg-cream`, `text-ink`, `rounded-marketing`), `tw-animate-css`
- **UI Components & Primitives:** Base UI (`@base-ui/react`) components, Lucide React icons, Embla Carousel (`embla-carousel-react`)
- **Forms & Validation:** React Hook Form (`react-hook-form`), Zod v4 (`zod`), `@hookform/resolvers`
- **Notifications & Feedback:** Sonner toast manager
- **Monorepo Integration:** Consumes shared contracts and DTO types from `@destino/shared`

---

## Directory Structure

```text
frontend/
├── src/
│   ├── app/                    # Next.js App Router routes & layouts
│   │   ├── (auth)/             # Authentication pages (signin, signup)
│   │   ├── admin/              # Administrative catalog portal (continents, countries, destinations)
│   │   ├── ai/                 # AI travel tools (plan-itinerary, compare)
│   │   ├── continents/         # Continent discovery and drill-down pages
│   │   ├── destinations/       # Destination browsing, search, and detail views
│   │   ├── favorites/          # Authenticated user saved destinations
│   │   ├── profile/            # User profile and account settings
│   │   ├── layout.tsx          # Root layout (Header, Footer, AuthProvider, FavoritesProvider)
│   │   └── page.tsx            # Editorial landing page & curated hero showcase
│   ├── components/             # Reusable UI components
│   │   ├── admin/              # Admin shell, entity forms, image input pickers
│   │   ├── ai/                 # Itinerary display, comparison tables, agent progress widgets
│   │   ├── auth/               # Auth modal/forms and social OAuth buttons
│   │   ├── reviews/            # Review list, submission form, rating displays
│   │   ├── ui/                 # Base buttons, cards, dialogs, dropdowns, inputs, badges
│   │   ├── auth-provider.tsx   # React Context for session management and user state
│   │   └── header.tsx / footer.tsx # Global editorial navigation and footer
│   ├── hooks/                  # Custom React hooks (responsive state, image input, admin delete)
│   ├── lib/
│   │   └── api/                # Modular API client for destinations, auth, admin, reviews
│   └── schemas/                # Client-side form validation schemas (Zod)
├── public/                     # Static assets, branding, and images
├── compose.dev.yaml            # Docker Compose dev configuration
├── compose.production.yaml     # Docker Compose production configuration
├── Dockerfile                  # Standalone production container build
├── DOCKER.md                   # Docker usage and internal networking instructions
├── next.config.ts              # Next.js compiler and image domain configurations
└── package.json                # Workspace dependencies and scripts
```

---

## Environment Variables

Create `frontend/.env.local` for local development:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:5000
```

| Variable              |        Required        | Context          | Description                                                                                      | Default / Example                                        |
| :-------------------- | :--------------------: | :--------------- | :----------------------------------------------------------------------------------------------- | :------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | Required in production | Client & Server  | The public API base URL reachable by browser clients. Defaults to localhost:5000 in development. | `http://localhost:5000`                                  |
| `API_INTERNAL_URL`    |        Optional        | Server-side only | Backend URL for server-side requests; overrides the public API URL on the server.                | `http://host.docker.internal:5000` in Docker development |

Set `NEXT_PUBLIC_API_URL` before running a production build; the value is embedded in the browser bundle. The Docker production guide supplies it as a build argument.

> **Note:** `NEXT_PUBLIC_API_URL` is required in production and is baked into the browser bundle at build time.

---

## Development Setup

### 1. Native Setup

1. Install dependencies from the repository root:
   ```bash
   npm install
   ```
2. Build the `@destino/shared` library dependency:
   ```bash
   npm run build:shared
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev:frontend
   # Or inside frontend/:
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Docker Setup

To develop using Docker, run from the repository root:

```bash
docker compose -f frontend/compose.dev.yaml up --build
```

Review [`DOCKER.md`](DOCKER.md) for details on container-to-host backend communication.

---

## Features & Routing

- **Editorial Home (`/`)**: Dynamic curated hero banners, featured destination carousels, and quick AI entry points.
- **Destinations Explorer (`/destinations`)**: Filterable catalog with search, category pills (Beach, Mountain, Historical, City, Adventure, Wildlife), and rating filters.
- **Canonical Destination Pages (`/continents/[continentSlug]/countries/[countrySlug]/[destinationSlug]`)**: Detailed view with attraction lists, ticket pricing, opening hours, AI review summaries, and community reviews.
- **AI Trip Planning (`/ai/plan-itinerary`)**: Interactive natural-language prompt interface generating multi-day structured itineraries with day-by-day breakdowns and budget estimates.
- **AI Destination Comparison (`/ai/compare`)**: Side-by-side criteria evaluation matrix comparing multiple destinations.
- **Admin Management Portal (`/admin`)**:
  - `/admin/continents` — Add and edit continents and upload cover imagery.
  - `/admin/continents/[slug]` — Country management drill-down.
  - `/admin/destinations` — Destination catalog management with multi-image uploaders and AI summary regeneration controls.
- **User Accounts & Favorites (`/favorites`, `/profile`)**: Bookmark destinations, review history, and account profile management.

---

## Development Scripts

| Command            | Action                                                                                                                         |
| :----------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`      | Starts Next.js development server on port 3000.                                                                                |
| `npm run build`    | Compiles an optimized production build (standalone mode enabled).                                                              |
| `npm run start`    | Runs Next.js using its standard start command. The Docker production image runs the generated standalone `server.js` directly. |
| `npm run lint`     | Runs Next.js ESLint validation.                                                                                                |
| `npx tsc --noEmit` | Runs full TypeScript verification across the frontend.                                                                         |

---

## Production Deployment

The frontend produces a self-contained standalone server (`output: "standalone"` in `next.config.ts`), making it ideal for Docker deployment.

To build and run the production image:

```bash
docker build -f frontend/Dockerfile --target production \
  --build-arg NEXT_PUBLIC_API_URL=https://api.yourdomain.com \
  -t destino-frontend:production .
```

---

## Related Documentation

- ⬅️ **[Monorepo Root README](../README.md)**
- ➡️ **[Backend Documentation](../backend/README.md)**
- 🐳 **[Frontend Docker Guide](DOCKER.md)**
