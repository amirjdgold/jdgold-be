import cors from 'cors';

/**
 * CORS for the JD Gold frontend (local Vite + production origins).
 * CORS_ORIGINS: comma-separated list, or * for any origin.
 * Empty → reflect request Origin (dev-friendly).
 *
 * The Admin UI is served from this same API host. Browsers send an Origin on
 * PUT/POST even for same-origin requests, so the API host is always allowed.
 */
export function allowedOriginsFromEnv(value = process.env.CORS_ORIGINS) {
  return (value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isSameOriginRequest(origin, req) {
  if (!origin || !req) return false;
  try {
    const requested = new URL(origin);
    const host = String(req.get?.('host') || req.headers?.host || '');
    if (!host || requested.host !== host) return false;
    const proto = String(
      req.get?.('x-forwarded-proto') || req.protocol || 'http',
    )
      .split(',')[0]
      .trim();
    return requested.protocol === `${proto}:`;
  } catch {
    return false;
  }
}

export function isAllowedOrigin(origin, req, allowedOrigins) {
  if (!origin) return true;
  if (allowedOrigins.includes('*') || allowedOrigins.length === 0) return true;
  if (allowedOrigins.includes(origin)) return true;
  return isSameOriginRequest(origin, req);
}

export function createCorsMiddleware() {
  const allowedOrigins = allowedOriginsFromEnv();

  return (req, res, next) =>
    cors({
      origin(origin, callback) {
        if (isAllowedOrigin(origin, req, allowedOrigins)) {
          return callback(null, true);
        }
        return callback(new Error(`CORS blocked for origin: ${origin}`));
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
    })(req, res, next);
}
