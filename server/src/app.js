import express from 'express';
import cors from 'cors';
import path from 'path';
import apiRouter from './routes/index.js';
import { notFoundHandler } from './middlewares/notFoundMiddleware.js';
import { errorHandler } from './middlewares/errorMiddleware.js';

// Initialize Express Application
const app = express();

// 1. Configure CORS
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 2. Parse Incoming Request Bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Serve Static Uploads (PDF Invoices, Images)
const uploadDir = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadDir));

// 4. Mount Primary API Router
app.use('/api/v1', apiRouter);

// 5. Fallback 404 Handler for Undefined Routes
app.use(notFoundHandler);

// 6. Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
