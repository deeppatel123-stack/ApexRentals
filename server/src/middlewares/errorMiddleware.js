/**
 * Centralized Error Handling Middleware.
 * Catches all synchronous and asynchronous errors forwarded via next(err).
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

  const responsePayload = {
    status,
    message: err.message || 'Internal Server Error',
  };

  // Include error stack trace only in development environment
  if (process.env.NODE_ENV === 'development') {
    responsePayload.stack = err.stack;
  }

  res.status(statusCode).json(responsePayload);
};
