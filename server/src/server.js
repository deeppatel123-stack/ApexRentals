import dotenv from 'dotenv';
// Load environment variables before any other application modules
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';
import { initializeCronJobs } from './jobs/cronJobs.js';

const PORT = process.env.PORT || 5000;

/**
 * Bootstrap function to initialize DB connection, background jobs, and listen for HTTP traffic.
 */
const startServer = async () => {
  try {
    // 1. Establish Database Connection
    await connectDB();

    // 2. Initialize Background Scheduled Jobs
    initializeCronJobs();

    // 3. Start HTTP Listener
    const server = app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 Rental Management System API running on port ${PORT}`);
      console.log(`📡 Health Check URL: http://localhost:${PORT}/api/v1/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`=======================================================`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error(`[Unhandled Rejection Error]: ${err.message}`);
      server.close(() => process.exit(1));
    });
  } catch (error) {
    console.error(`[Bootstrap Error]: Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
