Cloudflare deployment notes

This project includes a Workers-based backend and a static frontend (Vite) built to `./dist`.

Required Cloudflare resources
- Workers (obviously)
- R2 bucket for static assets (optional if using Workers Site)
- D1 or D2 database for persistent data (users, listings)
- Durable Objects for short-lived session stores (optional)
- KV namespace for small key-value storage (optional)

Secrets and GitHub configuration
- CF_API_TOKEN: a scoped API token with permissions to publish Workers, manage D1/D2/R2, and manage routes if needed.
- CF_ACCOUNT_ID: your Cloudflare account id (used by some scripts or manual wrangler commands).
- JWT_SECRET: a secret string used for signing simple tokens; for production use an env-managed secret and rotate regularly.

How to deploy
1. Create the Cloudflare resources listed above in the Cloudflare dashboard.
2. Set `account_id` in `wrangler.toml` or add `CF_ACCOUNT_ID` to GitHub secrets, and add `CF_API_TOKEN`.
3. Push to `master` — the GitHub Action `deploy.yml` will run `npm ci`, `npm run build`, and `wrangler publish`.

Notes on authentication
- The current Worker includes a minimal HMAC-based token system for demos. Replace it with a real JWT library or an external identity provider (Cloudflare Access, Auth0, Clerk, etc.) for production.
- Store passwords hashed (e.g. argon2) in D1/D2. Never store plaintext passwords.

Local development
- Use `npm run dev` to run the Vite dev server.
- Run the local mock API (`deploy/mockApi.js`) if you want to exercise the `/api` endpoints without deploying.
