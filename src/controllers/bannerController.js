import * as bannerService from '../services/bannerService.js';
import { sendSuccess } from '../utils/response.js';

export async function listBanners(_req, res) {
  const banners = await bannerService.listActiveBanners();
  return sendSuccess(res, banners);
}

export async function listAllBanners(_req, res) {
  return sendSuccess(res, await bannerService.listAllBanners());
}

export async function createBanner(req, res) {
  const banner = await bannerService.createBanner(req.body);
  return sendSuccess(res, banner, 201);
}

export async function updateBanner(req, res) {
  const banner = await bannerService.updateBannerById(req.params.id, req.body);
  return sendSuccess(res, banner);
}

export async function deleteBanner(req, res) {
  const banner = await bannerService.deleteBannerById(req.params.id);
  return sendSuccess(res, banner);
}
