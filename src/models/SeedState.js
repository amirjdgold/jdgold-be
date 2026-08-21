import mongoose from 'mongoose';

const seedStateSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    version: { type: Number, required: true },
  },
  { timestamps: true },
);

export const SeedState =
  mongoose.models.SeedState || mongoose.model('SeedState', seedStateSchema);
