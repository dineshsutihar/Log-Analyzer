import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { AppError } from './errors';

interface ErrorResponse {
    status: string;
    message: string;
    stack?: string;
    error?: any;
}

/**
 * Global error handling middleware
 * Must be placed after all routes
 */
export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Default error values
    let statusCode = 500;
    let message = 'Internal Server Error';
    let isOperational = false;

    // Check if it's our custom AppError
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        isOperational = err.isOperational;
    }

    // Log the error
    if (statusCode >= 500) {
        logger.error(`${err.message}${err.stack ? `\n${err.stack}` : ''}`);
    } else {
        logger.warn(`${req.method} ${req.path} - ${err.message}`);
    }

    // Prepare error response
    const errorResponse: ErrorResponse = {
        status: 'error',
        message,
    };

    // Add stack trace in development mode
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = err.stack;
        errorResponse.error = err;
    }

    // Send error response
    res.status(statusCode).json(errorResponse);
};

/**
 * Catch-all for 404 errors
 */
export const notFoundHandler = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const error = new AppError(
        `Cannot ${req.method} ${req.path}`,
        404
    );
    next(error);
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 */
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
