/**
 * Phase 4 CLI: seed MongoDB with initial JD Gold pages + GlobalBanner.
 *
 *   npm run seed         → upsert pages & banner (idempotent)
 *   npm run seed:clear   → remove seeded records only
 *
 * Requires MONGODB_URI in .env
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { clearSeedData, runSeed } from '../seed/runSeed.js';

const uri = process.env.MONGODB_URI?.trim();
if (!uri) {
  console.error('MONGODB_URI is not set. Copy .env.example to .env first.');
  process.exit(1);
}

const clearOnly = process.argv.includes('--clear');

try {
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  if (clearOnly) {
    await clearSeedData();
  } else {
    await runSeed();
  }
} catch (err) {
  console.error('Seed failed:', err);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect().catch(() => {});
}
