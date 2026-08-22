/**
 * Centralized Error Handling Middleware for DayFlow HRMS Backend
 */
function errorMiddleware(err, req, res, next) {
  console.error('[Error Occurred]', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method
  });

  // Handle SQLite Unique Constraint Violations
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE' || (err.message && err.message.includes('UNIQUE constraint failed'))) {
    return res.status(409).json({
      success: false,
      message: 'A record with this unique value already exists.'
    });
  }

  // Handle SQLite Foreign Key Constraint Failures
  if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY' || (err.message && err.message.includes('FOREIGN KEY constraint failed'))) {
    return res.status(400).json({
      success: false,
      message: 'Invalid reference ID provided. Foreign key constraint violated.'
    });
  }

  // Handle JSON Syntax Errors in Request Body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Malformed JSON payload in request body.'
    });
  }

  // Handle Multer upload errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`
    });
  }

  // Handle Custom Operational Status Codes
  const statusCode = err.status || err.statusCode || 500;
  const responseMessage = statusCode === 500 && process.env.NODE_ENV === 'production'
    ? 'Internal server error. Please try again later.'
    : err.message || 'An unexpected error occurred.';

  res.status(statusCode).json({
    success: false,
    message: responseMessage
  });
}

/**
 * 404 Route Not Found Middleware
 */
function notFoundMiddleware(req, res, next) {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
}

module.exports = {
  errorMiddleware,
  notFoundMiddleware
};
