import mongoose from 'mongoose';

export const MEDIA_CATEGORIES = [
  'general',
  'hero',
  'logo',
  'portrait',
  'gallery',
  'video',
];

const dimensionsSchema = new mongoose.Schema(
  {
    width: { type: Number, required: true, min: 1 },
    height: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const mediaAssetSchema = new mongoose.Schema(
  {
    pathname: {
      type: String,
      required: [true, 'Media pathname is required'],
      trim: true,
      maxlength: 500,
    },
    url: {
      type: String,
      required: [true, 'Media URL is required'],
      trim: true,
      maxlength: 2000,
    },
    sourcePath: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
      index: true,
    },
    mimeType: {
      type: String,
      required: [true, 'Media MIME type is required'],
      trim: true,
      maxlength: 200,
    },
    size: {
      type: Number,
      required: [true, 'Media size is required'],
      min: 0,
    },
    dimensions: {
      type: dimensionsSchema,
      default: undefined,
    },
    category: {
      type: String,
      enum: MEDIA_CATEGORIES,
      default: 'general',
      index: true,
    },
    alt: { type: String, trim: true, maxlength: 500, default: '' },
    caption: { type: String, trim: true, maxlength: 2000, default: '' },
  },
  {
    timestamps: true,
    collection: 'mediaassets',
  },
);

mediaAssetSchema.index({ pathname: 1 }, { unique: true });
mediaAssetSchema.index({ url: 1 }, { unique: true });
mediaAssetSchema.index({ createdAt: -1 });
mediaAssetSchema.index({
  pathname: 'text',
  url: 'text',
  alt: 'text',
  caption: 'text',
});

export const MediaAsset =
  mongoose.models.MediaAsset ||
  mongoose.model('MediaAsset', mediaAssetSchema);
