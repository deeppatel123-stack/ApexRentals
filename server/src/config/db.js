import mongoose from 'mongoose';

/**
 * Connects to MongoDB using the URI specified in environment variables.
 * Exits the process with failure code (1) if connection fails.
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('CRITICAL ERROR: MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    process.exit(1);
  }
};
