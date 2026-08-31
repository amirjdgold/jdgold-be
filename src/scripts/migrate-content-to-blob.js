import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { list, put } from '@vercel/blob';
import { connectDb } from '../db/connect.js';
import {
  SITE_CONTENT_ID,
  SiteContent,
} from '../models/SiteContent.js';
import { readSiteContentSeed } from '../services/site-content.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..', '..');
const UPLOAD_DIR = path.join(ROOT_DIR, 'uploads', 'cms');

async function loadEnv() {
  try {
    const text = await fs.readFile(path.join(ROOT_DIR, '.env'), 'utf8');
    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const separator = trimmed.indexOf('=');
      if (separator < 0) continue;
      const key = trimmed.slice(0, separator).trim();
      let value = trimmed.slice(separator + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = value;
    }
  } catch {
    // A .env file is optional when variables are supplied by the environment.
  }
}

function contentTypeFor(filename) {
  const types = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',
    '.m4v': 'video/x-m4v',
  };
  return types[path.extname(filename).toLowerCase()];
}

async function existingBlobUrls(token) {
  const urls = new Map();
  let cursor;
  do {
    const page = await list({ prefix: 'cms/', cursor, token });
    for (const blob of page.blobs) {
      const filename = blob.pathname.slice('cms/'.length);
      if (filename && !filename.includes('/')) urls.set(filename, blob.url);
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return urls;
}

function replaceUploadReferences(value, urls, stats) {
  if (typeof value === 'string') {
    return value.replace(
      /\/uploads\/cms\/([^"'?#\s)]+)/g,
      (original, encodedFilename) => {
        let filename = encodedFilename;
        try {
          filename = decodeURIComponent(encodedFilename);
        } catch {
          // Keep the original form if it is not valid URI encoding.
        }
        const replacement = urls.get(filename);
        if (!replacement) {
          stats.unresolved.add(filename);
          return original;
        }
        stats.replaced += 1;
        return replacement;
      },
    );
  }
  if (Array.isArray(value)) {
    return value.map((item) => replaceUploadReferences(item, urls, stats));
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        replaceUploadReferences(item, urls, stats),
      ]),
    );
  }
  return value;
}

await loadEnv();

const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) throw new Error('BLOB_READ_WRITE_TOKEN is required');
if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is required');
}

await connectDb({ seedPages: false });

try {
  const urls = await existingBlobUrls(token);
  const entries = await fs.readdir(UPLOAD_DIR, { withFileTypes: true }).catch(
    (error) => {
      if (error.code === 'ENOENT') return [];
      throw error;
    },
  );

  let uploaded = 0;
  for (const entry of entries) {
    if (!entry.isFile() || entry.name === '.gitkeep') continue;
    const contentType = contentTypeFor(entry.name);
    if (!contentType) {
      console.warn(`Skipped unsupported file: ${entry.name}`);
      continue;
    }
    const blob = await put(
      `cms/${entry.name}`,
      await fs.readFile(path.join(UPLOAD_DIR, entry.name)),
      {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType,
        token,
      },
    );
    urls.set(entry.name, blob.url);
    uploaded += 1;
    console.log(`Uploaded: ${entry.name}`);
  }

  const current = await SiteContent.findOne({
    _id: SITE_CONTENT_ID,
  }).lean();
  const source = current?.content || (await readSiteContentSeed());
  const stats = { replaced: 0, unresolved: new Set() };
  const migrated = replaceUploadReferences(source, urls, stats);

  await SiteContent.findOneAndUpdate(
    { _id: SITE_CONTENT_ID },
    { $set: { content: migrated } },
    { upsert: true, setDefaultsOnInsert: true },
  );

  console.log(
    `Migration complete: ${uploaded} file(s) uploaded, ${stats.replaced} reference(s) replaced.`,
  );
  if (stats.unresolved.size) {
    console.warn(
      `Unresolved local uploads (${stats.unresolved.size}): ${[
        ...stats.unresolved,
      ].join(', ')}`,
    );
  }
} finally {
  await mongoose.disconnect();
}
