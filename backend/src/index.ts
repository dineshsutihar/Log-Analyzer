import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import uploadRoutes from "./routes/upload";
import allLogs from "./routes/getAllLogs";
import getStats from "./routes/getStats";
import logtypeStatus from "./routes/logTypeStatus";
import connectToDatabase from "./db/connect";
import severityInfo from "./routes/severityInfo";
import getLogAnalytics from "./routes/getLogAnalytics";
import chatRouter from "./routes/chat";
import logger from "./utils/logger";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import {
  securityHeaders,
  limiter,
  sanitizeData,
  sanitizeInput,
  corsOptions,
} from "./middleware/security";
import { createIndexes } from "./db/indexes";

import { clerkMiddleware, getAuth } from "@clerk/express";

// Load environment variables
dotenv.config();

declare global {
  namespace Express {
    interface Request {
      auth: ReturnType<typeof getAuth>;
    }
  }
}

// Validate required environment variables
if (!process.env.CLERK_SECRET_KEY) {
  throw new Error("CLERK_SECRET_KEY is not defined in environment variables");
}

const app = express();
const PORT: number = parseInt(process.env.PORT || '3000', 10);

// ==================== Middleware ====================

// Security headers
app.use(securityHeaders);

// Morgan HTTP request logging
const morganFormat = process.env.NODE_ENV === 'development' ? 'dev' : 'combined';
app.use(morgan(morganFormat, {
  stream: {
    write: (message: string) => logger.http(message.trim())
  }
}));

// CORS
app.use(cors(corsOptions));

// Rate limiting
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization
app.use(sanitizeData);
app.use(sanitizeInput);

// Clerk authentication
app.use(
  clerkMiddleware({
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY || "",
    secretKey: process.env.CLERK_SECRET_KEY || "",
  })
);

// ==================== Database ====================

// Connect to database and create indexes
connectToDatabase()
  .then(async () => {
    logger.info('Connected to MongoDB');
    await createIndexes();
  })
  .catch((error) => {
    logger.error(`Database connection failed: ${error}`);
    process.exit(1);
  });

// ==================== Routes ====================

// Health check endpoint
app.get("/health", (req: Request, res: Response): void => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Root endpoint
app.get("/", (req: Request, res: Response): void => {
  res.send("Log Analyzer Backend is running!");
});

// API routes
app.use("/api", uploadRoutes);
app.use("/api", allLogs);
app.use("/api", getStats);
app.use("/api", logtypeStatus);
app.use("/api", severityInfo);
app.use("/api", getLogAnalytics);
app.use("/api", chatRouter);

// ==================== Error Handling ====================

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

// ==================== Server Start ====================

app.listen(PORT, (): void => {
  logger.info(`Server is running on http://localhost:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error) => {
  logger.error(`Unhandled Rejection: ${reason.message}`);
  logger.error(reason.stack || '');
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error(`Uncaught Exception: ${error.message}`);
  logger.error(error.stack || '');
  process.exit(1);
});

