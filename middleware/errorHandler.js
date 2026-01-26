/**
 * Error Handler Middleware
 * Centralized error handling
 */

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }
  
  // Send JSON for API requests
  if (req.path.startsWith('/api/')) {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
  
  // Render error page
  res.status(statusCode).render('errors/error', {
    pageTitle: `Error ${statusCode}`,
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  notFound,
  errorHandler
};
