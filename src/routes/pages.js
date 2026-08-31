import { Router } from 'express';
import * as pagesController from '../controllers/pagesController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireApiKey } from '../middleware/requireApiKey.js';
import { validate } from '../middleware/validate.js';
import {
  createPageSchema,
  updatePageSchema,
  pageSlugParamsSchema,
  mongoIdParamsSchema,
} from '../validators/pageBanner.js';

const router = Router();

router.get('/', asyncHandler(pagesController.listPages));

router.post(
  '/',
  requireApiKey,
  validate({ body: createPageSchema }),
  asyncHandler(pagesController.createPage)
);

router.get(
  '/:slug',
  validate({ params: pageSlugParamsSchema }),
  asyncHandler(pagesController.getPageBySlug)
);

router.put(
  '/:id',
  requireApiKey,
  validate({ params: mongoIdParamsSchema, body: updatePageSchema }),
  asyncHandler(pagesController.updatePage)
);

router.delete(
  '/:id',
  requireApiKey,
  validate({ params: mongoIdParamsSchema }),
  asyncHandler(pagesController.deletePage)
);

export default router;
