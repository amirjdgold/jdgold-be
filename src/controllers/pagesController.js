import * as pageService from '../services/pageService.js';
import { sendSuccess } from '../utils/response.js';

export async function listPages(_req, res) {
  const pages = await pageService.listActivePages();
  return sendSuccess(res, pages);
}

export async function listAllPages(_req, res) {
  return sendSuccess(res, await pageService.listAllPages());
}

export async function getPageBySlug(req, res) {
  const page = await pageService.getPageBySlug(req.params.slug);
  return sendSuccess(res, page);
}

export async function createPage(req, res) {
  const page = await pageService.createPage(req.body);
  return sendSuccess(res, page, 201);
}

export async function updatePage(req, res) {
  const page = await pageService.updatePageById(req.params.id, req.body);
  return sendSuccess(res, page);
}

export async function deletePage(req, res) {
  const page = await pageService.deletePageById(req.params.id);
  return sendSuccess(res, page);
}
