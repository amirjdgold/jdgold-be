/**
 * @param {import('express').Response} res
 * @param {unknown} data
 * @param {number} [status=200]
 */
export function sendSuccess(res, data, status = 200) {
  return res.status(status).json({
    success: true,
    data,
  });
}

/**
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} [status=400]
 */
export function sendError(res, message, status = 400) {
  return res.status(status).json({
    success: false,
    message,
  });
}
