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
- Every successful Blob or local upload is registered in the `mediaassets` collection. Authenticated admins can search, filter, edit metadata, reuse, and safely delete assets from `/admin`. Deletion is refused while the exact URL/path is referenced by SiteContent, Page, or GlobalBanner.
- Blob completion callbacks are verified by the official Vercel Blob handler. `API_KEY` is checked when issuing a browser upload token, not on provider callbacks.
- Without `BLOB_READ_WRITE_TOKEN`, local development keeps the existing `uploads/cms` disk upload and image-variant behavior. Disk uploads are intentionally disabled on Vercel.
- MongoDB must be Atlas in production (not `localhost`).
- Set `CORS_ORIGINS` to the exact frontend origin (no trailing slash).

The checked-in `public/admin-upload.js` bundle lets the standalone `public/admin.html` use the official Vercel Blob browser client. Rebuild it after editing `src/browser/admin-upload.js`:

```bash
npm run build:admin-upload
```

## One-time migration

Set `MONGODB_URI` and `BLOB_READ_WRITE_TOKEN`, then preview:

```bash
npm run migrate:blob:dry-run
```

Apply after reviewing the unresolved/orphan report:

```bash
npm run migrate:blob
```

The migration is idempotent. It scans backend `uploads/cms` plus frontend
`public/images` and `public/videos` (default sibling project:
`../jdg-web-frontend/public`; override with `FRONTEND_PUBLIC_DIR`). Files use
deterministic `cms/migrated/...` Blob paths. It upserts MediaAssets and
recursively rewrites live SiteContent, Page, and GlobalBanner media values.
Unresolved local references and uploaded-but-unreferenced assets are reported.

Seed files intentionally keep portable `/images`, `/videos`, and
`/uploads/cms` paths. At seed time those values are resolved through
MediaAsset `sourcePath` mappings, avoiding an account-specific Blob hostname
in version control.

## Admin APIs

All routes below require `Authorization: Bearer <API_KEY>` (or `x-api-key`):

- `GET /api/media-assets` — paginated search/filter
- `PATCH /api/media-assets/:id` — alt, caption, and category
- `DELETE /api/media-assets/:id` — reference-safe storage deletion
- `GET /api/pages/admin/all` and `GET /api/banner/admin/all` — include inactive documents

## Checks

```bash
npm run check
```
