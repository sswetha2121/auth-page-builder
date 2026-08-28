/* =========================================================
   AUTH PAGE BUILDER - ERROR HANDLING MIDDLEWARE
   File: backend/middleware/error.middleware.js
========================================================= */

function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Prevent exposing DB credentials, queries, or internals
  console.error(`[API Error] [${req.method} ${req.originalUrl}]:`, message);

  res.status(status).json({
    success: false,
    status,
    message
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    status: 404,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
