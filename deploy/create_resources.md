Creating Cloudflare resources (quick guide)

1) Create an API token
   - Go to Cloudflare Dashboard → My Profile → API Tokens → Create Token
   - Grant permissions: Account.Workers Scripts, Account.R2 (read/write), D1/D2 (if used), Zone.Zone (if deploying routes)

2) R2 bucket
   - Using Dashboard: Storage → R2 → Create bucket (name: bouncie-assets)
   - Or: wrangler r2 bucket create bouncie-assets --account-id <ACCOUNT_ID>

3) D1/D2
   - Create a D1 or D2 database via Cloudflare Dashboard (Workers → D1 or D2)
   - Note the binding name and add it to `wrangler.toml`

4) Durable Objects
   - Add a Durable Object class in `wrangler.toml` as shown in the example and implement the class in your worker code.

5) Secrets and variables
   - Set secrets using `wrangler secret put JWT_SECRET` or via the Cloudflare Dashboard
   - Add `CF_API_TOKEN` and `CF_ACCOUNT_ID` to your GitHub repository secrets for CI

6) Deploy
   - Confirm `wrangler.toml` account_id set, then run `wrangler publish --env production`
