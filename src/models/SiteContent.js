import mongoose from 'mongoose';

const siteContentSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      immutable: true,
      default: 'site',
    },
    content: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
);

export const SITE_CONTENT_ID = 'site';
export const SiteContent =
  mongoose.models.SiteContent ||
  mongoose.model('SiteContent', siteContentSchema);
