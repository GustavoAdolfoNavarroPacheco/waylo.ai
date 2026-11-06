# Docker: Waylo citizen frontend

The image runs the Next.js frontend in production mode on port `3000`. The server-side variables (`DATABASE_URL`,
`AUTH_SECRET`, `WAYLO_BACKEND_URL` and `WAYLO_BACKEND_KEY`, among others) are injected when the container runs; they are
not baked into the image or passed as build arguments.

## Build and run

```bash
docker build -t waylo-frontend .
docker run --rm --env-file .env -p 3000:3000 waylo-frontend
```

The `HEALTHCHECK` queries `/` on internal port `3000`.

The current lockfile does not allow `npm ci` because it is missing optional `@emnapi` entries; that is why the Dockerfile
temporarily uses `npm install --package-lock=false`. After `package-lock.json` is synchronized, it must be switched to
`npm ci`.
