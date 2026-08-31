/**
 * Require API_KEY via Authorization: Bearer <key> or x-api-key header.
 */
export function requireApiKey(req, res, next) {
  const key = process.env.API_KEY;
  if (!key) {
    return res.status(503).json({ error: 'API_KEY is not configured' });
  }
  const bearer = req.headers.authorization?.replace(/^Bearer\s+/i, '')?.trim();
  const headerKey = req.headers['x-api-key'];
  const provided = bearer || (typeof headerKey === 'string' ? headerKey : '');
  if (provided !== key) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}
