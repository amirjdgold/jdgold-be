import { z } from 'zod';
import { MEDIA_CATEGORIES } from '../models/MediaAsset.js';

export const listMediaSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(24),
  search: z.string().trim().max(200).optional().default(''),
  category: z.enum(MEDIA_CATEGORIES).optional(),
  kind: z.enum(['image', 'video']).optional(),
});

export const mediaIdParamsSchema = z.object({
  id: z.string().trim().min(1),
});

export const updateMediaSchema = z
  .object({
    category: z.enum(MEDIA_CATEGORIES).optional(),
    alt: z.string().trim().max(500).optional(),
    caption: z.string().trim().max(2000).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one metadata field is required',
  });

export const registerMediaSchema = z.object({
  url: z.string().trim().url(),
  category: z.enum(MEDIA_CATEGORIES).optional().default('general'),
  alt: z.string().trim().max(500).optional().default(''),
  caption: z.string().trim().max(2000).optional().default(''),
});
