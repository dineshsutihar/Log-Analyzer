import { Request, Response, NextFunction } from 'express';
import CacheService from '../utils/cache';
import logger from '../utils/logger';

/**
 * Cache middleware factory
 * Caches GET requests based on URL and query parameters
 */
export const cacheMiddleware = (ttl: number = 300) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        try {
            const cache = new CacheService(ttl);

            // Create cache key from URL, query params, and user ID
            const userId = req.auth?.userId || 'anonymous';
            const cacheKey = `cache:${userId}:${req.originalUrl}`;

            // Check if cached
            const cachedData = await cache.get(cacheKey);

            if (cachedData) {
                logger.debug(`Cache HIT for ${cacheKey}`);
                return res.json(cachedData);
            }

            logger.debug(`Cache MISS for ${cacheKey}`);

            // Store original json method
            const originalJson = res.json.bind(res);

            // Override json method to cache response
            res.json = function (data: any) {
                // Only cache successful responses
                if (res.statusCode === 200) {
                    cache.set(cacheKey, data, ttl).catch((error) => {
                        logger.error(`Failed to cache response: ${error}`);
                    });
                }
                return originalJson(data);
            };

            next();
        } catch (error) {
            logger.error(`Cache middleware error: ${error}`);
            next(); // Continue without caching on error
        }
    };
};

/**
 * Invalidate cache for specific user or pattern
 */
export const invalidateCache = async (pattern: string): Promise<void> => {
    try {
        const cache = new CacheService();
        await cache.delPattern(pattern);
        logger.info(`Cache invalidated for pattern: ${pattern}`);
    } catch (error) {
        logger.error(`Cache invalidation error: ${error}`);
    }
};

/**
 * Invalidate user-specific cache
 */
export const invalidateUserCache = async (userId: string): Promise<void> => {
    await invalidateCache(`cache:${userId}:*`);
};

/**
 * Invalidate all cache
 */
export const invalidateAllCache = async (): Promise<void> => {
    await invalidateCache('cache:*');
};
