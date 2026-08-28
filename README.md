# jdgold-be

Express API for JD Gold. Deploy on **Vercel**. Frontend on Cloudflare Pages.

## Local

```bash
cp .env.example .env
# Edit .env — set MONGODB_URI (and API_KEY for admin writes)
npm install
npm run server:dev
```

Useful scripts:

| Script | Purpose |
|--------|---------|
| `npm run server` / `npm start` | Production-style start |
| `npm run server:dev` / `npm run dev` | Nodemon watch mode |
| `npm run seed` | Upsert initial pages + GlobalBanner (idempotent) |
| `npm run seed:clear` | Remove seeded pages/banners only |
| `npm run seed:pages` | Alias of `npm run seed` |

Health check: `GET http://localhost:3001/api/health`

## Deploy to Vercel (dashboard)

1. Import repo `amirjdgold/jdgold-be` in [Vercel](https://vercel.com/new)
2. Framework preset: **Other**
3. Root directory: `.` (repo root)
4. Add Environment Variables (Production):

| Name | Value |
|------|--------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `API_KEY` | strong secret (same as admin login) |
| `CORS_ORIGINS` | your Cloudflare Pages URL, e.g. `https://jdgold-fe.pages.dev` |
| `NODE_ENV` | `production` |
| `SERVE_STATIC` | `false` |

5. Deploy → note the URL, e.g. `https://jdgold-be.vercel.app`
6. Smoke test: `https://jdgold-be.vercel.app/api/health` → `{"success":true,"message":"JD Gold API is running"}`

## Important limits on Vercel

- **MongoDB** must be Atlas (not `localhost`)
- **Uploads** (`/uploads/cms`) and **CMS file writes** (`data/site.json`) are ephemeral on serverless — fine for read of seeded content; for lasting media/CMS edits, add R2/S3 later
- After Cloudflare is live, set `CORS_ORIGINS` to that exact origin (no trailing slash)
