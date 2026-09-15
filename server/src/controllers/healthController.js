import mongoose from 'mongoose';

/**
 * Health check controller.
 * Returns API health status, server uptime, current timestamp, and database connectivity.
 */
export const getHealthStatus = (req, res) => {
  const dbStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const dbStatus = dbStateMap[mongoose.connection.readyState] || 'unknown';

  return res.status(200).json({
    status: 'success',
    message: 'Rental Management System API is healthy and running',
    data: {
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: dbStatus,
        readyState: mongoose.connection.readyState,
      },
    },
  });
};
