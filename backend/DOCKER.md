# Backend Docker workflow

## Development

Copy `.env.example` to `.env` and fill in any optional integrations you use. The
Compose file supplies container-local MongoDB and Redis URLs, so host-side
`localhost` URLs in `.env` do not override them.

From `backend/`, start the API and its local dependencies:

```sh
docker compose -f compose.dev.yaml up --build
```

The API is available at `http://localhost:5000`. Source files are bind-mounted
for `tsx watch`. MongoDB runs as a single-node replica set because transaction
based service operations require a replica set; MongoDB and Redis data persist
in named Docker volumes. Stop the services with `docker compose -f
compose.dev.yaml down`. Add `-v` only when you also want to remove local database
data.

### Seeding Development Data

To seed the local database with demo continents, countries, destinations, users, and reviews, execute the seed script inside the running `api` container where MongoDB's replica set hostname (`mongo:27017`) resolves natively:

```sh
docker compose -f compose.dev.yaml exec api npm run seed -- --force
```

> **Note:** Seeding is destructive and wipes existing catalog data. The `--force` flag (or `SEED_ALLOW_DESTRUCTIVE=1` environment variable) is required to confirm execution. If you prefer running scripts directly from the host machine outside Docker, map `127.0.0.1 mongo` in your operating system's `hosts` file (`C:\Windows\System32\drivers\etc\hosts` on Windows or `/etc/hosts` on macOS/Linux) so the host can resolve the replica set member.

## Production image

Build the production image from `backend/`:

```sh
docker build --target production -t destino-backend:production -f Dockerfile ..
```

The image compiles TypeScript in a build stage, contains production dependencies
and compiled JavaScript only, and runs as the unprivileged `node` user. It has a
Docker health check against `/health` and handles `SIGTERM` for graceful
shutdown.

For Compose deployment, create an untracked `backend/.env.production` file with
the production configuration. At minimum, provide `DATABASE_URL`, `REDIS_URL`,
`JWT_SECRET` (at least 32 characters and not a placeholder), `CLIENT_URL` (an
HTTPS origin), and `GOOGLE_GENERATIVE_AI_API_KEY`. Add the Cloudinary and OAuth
variables as complete groups if those integrations are enabled. Set
`TRUST_PROXY` to the actual proxy hop count or trusted IP/CIDR list in front of
the container; leave it `false` when the API is directly exposed. The database
and Redis should be managed/external services reachable from the container.

Then deploy with:

```sh
docker compose -f compose.production.yaml up --build -d
```

The Compose file publishes port 3000 by default. Set `HOST_PORT` to change the
host port. Production secrets are injected at runtime from `.env.production`;
they are excluded from the Docker build context. Use your platform's secret
manager instead of the env file when available.
