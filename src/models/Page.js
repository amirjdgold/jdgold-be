import mongoose from 'mongoose';
import {
  PAGE_TYPES,
  heroSchema,
  sectionSchema,
} from './schemas/contentBlocks.js';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const pageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Page title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Page slug is required'],
      trim: true,
      lowercase: true,
      maxlength: [120, 'Slug cannot exceed 120 characters'],
      validate: {
        validator(value) {
          return SLUG_PATTERN.test(value);
        },
        message:
          'Slug must be lowercase kebab-case (letters, numbers, hyphens)',
      },
    },
    pageType: {
      type: String,
      required: [true, 'pageType is required'],
      enum: {
        values: PAGE_TYPES,
        message: 'Invalid pageType: `{VALUE}`',
      },
    },
    metaTitle: {
      type: String,
      trim: true,
      maxlength: [70, 'metaTitle should stay within ~70 characters'],
      default: '',
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: [320, 'metaDescription cannot exceed 320 characters'],
      default: '',
    },
    hero: {
      type: heroSchema,
      default: () => ({}),
    },
    sections: {
      type: [sectionSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    collection: 'pages',
  }
);

pageSchema.index({ slug: 1 }, { unique: true });
pageSchema.index({ pageType: 1, isActive: 1 });
pageSchema.index({ isActive: 1, sortOrder: 1 });

pageSchema.pre('validate', function normalizeSlug() {
  if (typeof this.slug === 'string') {
    this.slug = this.slug.trim().toLowerCase();
  }
});

export const Page =
  mongoose.models.Page || mongoose.model('Page', pageSchema);
