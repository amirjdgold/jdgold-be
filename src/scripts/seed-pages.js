import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import mongoose from 'mongoose';
import { Page } from '../models/Page.js';
import { PAGE_SEEDS } from '../seed/pages.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function loadEnv() {
  const envPath = path.join(__dirname, '..', '..', '.env');
  try {
    const text = await fs.readFile(envPath, 'utf8');
    for (const line of text.split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const i = t.indexOf('=');
      if (i === -1) continue;
      const key = t.slice(0, i).trim();
      let val = t.slice(i + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = val;
    }
  } catch {
    /* optional */
  }
}

await loadEnv();

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jdg-web';
await mongoose.connect(uri);

for (const seed of PAGE_SEEDS) {
  await Page.findOneAndUpdate(
    { slug: seed.slug },
    { $set: { title: seed.title, content: seed.content } },
    { upsert: true }
  );
  console.log(`Upserted page: ${seed.slug}`);
}

console.log(`Re-seeded ${PAGE_SEEDS.length} pages with design layouts`);
await mongoose.disconnect();
