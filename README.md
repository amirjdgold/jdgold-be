# jdgold-be

Express API for JD Gold. Deploy the API and frontend as separate **Vercel** projects.

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
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob store read/write token |
| `CORS_ORIGINS` | exact frontend origin, e.g. `https://jdgold-fe.vercel.app` |
| `NODE_ENV` | `production` |
| `SERVE_STATIC` | `false` |

5. Deploy → note the URL, e.g. `https://jdgold-be.vercel.app`
6. Smoke test: `https://jdgold-be.vercel.app/api/health` → `{"success":true,"message":"JD Gold API is running"}`

## CMS storage

- The singleton site payload is stored in MongoDB. `data/site.json` is only the initial seed and a read fallback; production requests never write it.
- Admin media is uploaded directly from the browser to Vercel Blob, avoiding the Vercel function body limit. The browser only receives a short-lived token restricted to `cms/`, image/video MIME types, and 100 MB. `BLOB_READ_WRITE_TOKEN` remains server-side.
- Without `BLOB_READ_WRITE_TOKEN`, local development keeps the existing `uploads/cms` disk upload and image-variant behavior. Disk uploads are intentionally disabled on Vercel.
- MongoDB must be Atlas in production (not `localhost`).
- Set `CORS_ORIGINS` to the exact frontend origin (no trailing slash).

The checked-in `public/admin-upload.js` bundle lets the standalone `public/admin.html` use the official Vercel Blob browser client. Rebuild it after editing `src/browser/admin-upload.js`:

```bash
npm run build:admin-upload
```

## One-time migration

Set `MONGODB_URI` and `BLOB_READ_WRITE_TOKEN`, then run:

```bash
npm run migrate:blob
```

The migration is safe to rerun. It uploads supported files from `uploads/cms` to deterministic `cms/` Blob paths, also discovers already-uploaded Blob files, replaces matching `/uploads/cms/...` references, and upserts the MongoDB singleton. It starts from live MongoDB content when present, so reruns do not reset later CMS edits. Any unresolved references are reported and left unchanged.

## Checks

```bash
npm run check
```
