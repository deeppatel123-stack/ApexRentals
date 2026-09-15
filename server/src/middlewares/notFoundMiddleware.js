/**
 * Middleware to catch 404 Not Found requests.
 * Triggers when a client requests an endpoint that is not registered on the router.
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Cannot find ${req.method} ${req.originalUrl} on this server.`,
  });
};
