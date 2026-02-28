import mongoose from "mongoose";
import logger from "../utils/logger";

export default async function connectToDatabase(): Promise<void> {
  const mongoURI = process.env.MONGODB_URI || "mongodb://db:27017/loganalyzer";

  logger.info("Connecting to MongoDB...");
  logger.debug(`MongoDB URI: ${mongoURI.replace(/\/\/.*@/, '//***@')}`); // Hide credentials in logs

  try {
    await mongoose.connect(mongoURI, {
      // Connection pool settings
      maxPoolSize: 10, // Maximum number of connections in the pool
      minPoolSize: 2,  // Minimum number of connections to maintain

      // Timeout settings
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,

      // Connection management
      maxIdleTimeMS: 10000,

      // Write concern
      w: 'majority',
      retryWrites: true,

      // Read preference
      readPreference: 'primary',
    });

    logger.info("MongoDB connected successfully");

    // Connection event listeners
    mongoose.connection.on('connected', () => {
      logger.info('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      logger.error(`Mongoose connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('Mongoose disconnected from MongoDB');
    });

    // If the Node process ends, close the Mongoose connection
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('Mongoose connection closed due to app termination');
      process.exit(0);
    });

  } catch (err) {
    logger.error(`MongoDB connection error: ${err}`);
    throw err;
  }
}
