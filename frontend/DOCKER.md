# Frontend Docker workflow

The frontend is part of the npm monorepo and imports `@destino/shared`. Build
with the repository root as the Docker context so the shared package is
available. The Dockerfile uses the frontend lockfile, builds Next.js in
standalone mode, and runs the production server as an unprivileged user.

## Development

Start the backend separately using the instructions in `backend/DOCKER.md`, then
start the frontend from the repository root:

```sh
docker compose -f frontend/compose.dev.yaml up --build
```

The site is available at `http://localhost:3000`. By default, browser requests
use `http://localhost:5000`, and server-rendered requests use
`http://host.docker.internal:5000` to reach the backend port published on the
host. Override `NEXT_PUBLIC_API_URL` or `API_INTERNAL_URL` if your setup uses
different addresses.

## Production image

Create `frontend/.env.production` with the public API origin that browsers will
use:

```dotenv
NEXT_PUBLIC_API_URL=https://api.example.com
HOST_PORT=3000
```

Build and start the production container from the repository root:

```sh
docker compose --env-file frontend/.env.production -f frontend/compose.production.yaml up --build -d
```

`NEXT_PUBLIC_API_URL` is embedded in the browser bundle at build time. Set
`API_INTERNAL_URL` in the production environment when the frontend container
should use a private backend address for server-side requests; otherwise it
uses the public API origin. Configure the backend's `CLIENT_URL` to the public
frontend origin. Use TLS at the reverse proxy or load balancer and set
`HOST_PORT` to the desired host-side port.

To build the image directly, from the repository root:

```sh
docker build -f frontend/Dockerfile --target production \
  --build-arg NEXT_PUBLIC_API_URL=https://api.example.com \
  -t destino-frontend:production .
```
