/**
 * 404 for unmatched API routes (and other paths that reach this middleware).
 */
export function notFoundHandler(req, res, _next) {
  res.status(404).json({
    success: false,
    message: `Not found: ${req.method} ${req.originalUrl}`,
  });
}

/**
 * Central Express error handler. Must be registered last.
 * Never forwards raw database / driver errors to the client.
 */
export function errorHandler(err, _req, res, _next) {
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Mongoose bad ObjectId / cast
  if (err?.name === 'CastError') {
    status = 400;
    message = 'Invalid id';
  }

  // Mongoose schema validation
  if (err?.name === 'ValidationError') {
    status = 400;
    const first = Object.values(err.errors || {})[0];
    message = first?.message || 'Validation failed';
  }

  // Duplicate key (e.g. unique slug)
  if (err?.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    message = `A record with this ${field} already exists`;
  }

  if (status >= 500) {
    console.error(err);
  }

  // CORS package may reject via callback Error
  if (typeof message === 'string' && message.startsWith('CORS blocked')) {
    return res.status(403).json({
      success: false,
      message,
    });
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const safeMessage =
    status >= 500 && isProduction && !err.isOperational
      ? 'Internal server error'
      : message;

  res.status(status).json({
    success: false,
    message: safeMessage,
  });
}
