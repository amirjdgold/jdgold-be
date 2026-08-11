import { Router } from 'express';
import { Page } from '../models/Page.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const pages = await Page.find({}, 'slug title content.layout').sort({
      slug: 1,
    });
    res.json(pages);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to list pages' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug }).lean();
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.json(page);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to read page' });
  }
});

export default router;
