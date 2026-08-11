import mongoose from 'mongoose';

const pageSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    /** Full page payload matching the design layout */
    content: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export const Page = mongoose.models.Page || mongoose.model('Page', pageSchema);
