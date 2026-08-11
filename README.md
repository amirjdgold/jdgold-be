# jdg-web backend

Express API for JD Gold CMS/content. Deploy to **Vercel** (or any Node host).

## Local development

```bash
cp .env.example .env
# set API_KEY and MONGODB_URI
npm install
npm run dev
```

API defaults to `http://localhost:3001`.

## Production (Vercel)

1. Connect this repo in Vercel
2. Set env vars: `MONGODB_URI`, `API_KEY`, `CORS_ORIGINS` (your Cloudflare Pages origin)
3. Deploy

Notes:

- Uploaded files under `uploads/cms` need durable storage on Vercel (ephemeral disk). Plan for object storage (e.g. R2/S3) before relying on uploads in production.
- Prefer Cloudflare Pages for the frontend; keep `SERVE_STATIC=false`.
