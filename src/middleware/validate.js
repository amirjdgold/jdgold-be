import { AppError } from '../utils/AppError.js';

/**
 * Validate request parts with Zod schemas.
 * @param {{ body?: import('zod').ZodTypeAny, params?: import('zod').ZodTypeAny, query?: import('zod').ZodTypeAny }} schemas
 */
export function validate(schemas) {
  return (req, _res, next) => {
    try {
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      if (schemas.query) {
        req.validatedQuery = schemas.query.parse(req.query);
      }
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      next();
    } catch (err) {
      if (err?.name === 'ZodError') {
        const first = err.errors?.[0];
        const path = first?.path?.length ? first.path.join('.') : null;
        const message = path
          ? `${path}: ${first.message}`
          : first?.message || 'Validation failed';
        return next(new AppError(message, 400));
      }
      next(err);
    }
  };
}
