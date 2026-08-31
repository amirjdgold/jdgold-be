import { Router } from 'express';
import * as bannerController from '../controllers/bannerController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireApiKey } from '../middleware/requireApiKey.js';
import { validate } from '../middleware/validate.js';
import {
  createBannerSchema,
  updateBannerSchema,
  mongoIdParamsSchema,
} from '../validators/pageBanner.js';

const router = Router();

router.get('/', asyncHandler(bannerController.listBanners));

router.get(
  '/admin/all',
  requireApiKey,
  asyncHandler(bannerController.listAllBanners)
);

router.post(
  '/',
  requireApiKey,
  validate({ body: createBannerSchema }),
  asyncHandler(bannerController.createBanner)
);

router.put(
  '/:id',
  requireApiKey,
  validate({ params: mongoIdParamsSchema, body: updateBannerSchema }),
  asyncHandler(bannerController.updateBanner)
);

router.delete(
  '/:id',
  requireApiKey,
  validate({ params: mongoIdParamsSchema }),
  asyncHandler(bannerController.deleteBanner)
);

export default router;
