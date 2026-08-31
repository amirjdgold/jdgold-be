import * as mediaService from '../services/mediaService.js';
import { sendSuccess } from '../utils/response.js';

export async function listMedia(req, res) {
  return sendSuccess(
    res,
    await mediaService.listMedia(req.validatedQuery ?? req.query),
  );
}

export async function updateMedia(req, res) {
  return sendSuccess(
    res,
    await mediaService.updateMedia(req.params.id, req.body),
  );
}

export async function registerMedia(req, res) {
  return sendSuccess(
    res,
    await mediaService.registerVerifiedBlob(req.body.url, req.body),
    201,
  );
}

export async function deleteMedia(req, res) {
  return sendSuccess(res, await mediaService.deleteMedia(req.params.id));
}
