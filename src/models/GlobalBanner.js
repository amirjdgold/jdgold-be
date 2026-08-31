import mongoose from 'mongoose';
import { imageRefSchema } from './schemas/contentBlocks.js';

/**
 * Site-wide top banner / horizontal image gallery.
 * Rendered at the top of every major page (application layer),
 * not embedded per Page document.
 */
const globalBannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Banner title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    /** Horizontal gallery strip — URL/path strings only. */
    images: {
      type: [imageRefSchema],
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: 'Banner must include at least one image',
      },
    },
    /** Shared fallback alt when an image entry omits alt. */
    imageAlt: {
      type: String,
      trim: true,
      default: '',
      maxlength: [200, 'imageAlt cannot exceed 200 characters'],
    },
    link: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'link cannot exceed 500 characters'],
    },
    order: {
      type: Number,
      default: 0,
      min: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'globalbanners',
  }
);

globalBannerSchema.index({ active: 1, order: 1 });

export const GlobalBanner =
  mongoose.models.GlobalBanner ||
  mongoose.model('GlobalBanner', globalBannerSchema);
