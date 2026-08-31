import { Router } from 'express';
import * as mediaController from '../controllers/mediaController.js';
import { requireApiKey } from '../middleware/requireApiKey.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  listMediaSchema,
  mediaIdParamsSchema,
  registerMediaSchema,
  updateMediaSchema,
} from '../validators/media.js';

const router = Router();

router.use(requireApiKey);

router.get(
  '/',
  validate({ query: listMediaSchema }),
  asyncHandler(mediaController.listMedia),
);
router.post(
  '/register',
  validate({ body: registerMediaSchema }),
  asyncHandler(mediaController.registerMedia),
);
router.patch(
  '/:id',
  validate({ params: mediaIdParamsSchema, body: updateMediaSchema }),
  asyncHandler(mediaController.updateMedia),
);
router.delete(
  '/:id',
  validate({ params: mediaIdParamsSchema }),
  asyncHandler(mediaController.deleteMedia),
);

export default router;
