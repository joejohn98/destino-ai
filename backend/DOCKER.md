# Backend Docker workflow

## Development

Copy `.env.example` to `.env` and fill in any optional integrations you use. The
Compose file supplies container-local MongoDB and Redis URLs, so host-side
`localhost` URLs in `.env` do not override them.

From `backend/`, start the API and its local dependencies:

```sh
docker compose -f compose.dev.yaml up --build
```

The API is available at `http://localhost:3000`. Source files are bind-mounted
for `tsx watch`. MongoDB runs as a single-node replica set because transaction
based service operations require a replica set; MongoDB and Redis data persist
in named Docker volumes. Stop the services with `docker compose -f
compose.dev.yaml down`. Add `-v` only when you also want to remove local database
data.

## Production image

Build the production image from `backend/`:

```sh
docker build --target production -t destino-backend:production .
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
