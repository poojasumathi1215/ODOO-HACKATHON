const { validationResult, body, param, query } = require('express-validator');

/**
 * Middleware that checks for validation errors from express-validator
 * Returns standard DayFlow error format: { success: false, message: 'Validation failed', errors: [...] }
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: errors.array()[0].msg || 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
}

module.exports = {
  handleValidationErrors,
  body,
  param,
  query
};
