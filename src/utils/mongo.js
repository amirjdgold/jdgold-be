import mongoose from 'mongoose';
import { AppError } from './AppError.js';

/**
 * @param {string} id
 * @param {string} [label='Resource']
 * @returns {string}
 */
export function assertValidObjectId(id, label = 'Resource') {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(`Invalid ${label} id`, 400);
  }
  return id;
}
