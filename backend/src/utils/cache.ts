import Redis from 'ioredis';
import logger from './logger';

// Redis client instance
let redisClient: Redis | null = null;

/**
 * Initialize Redis connection
 */
export const initRedis = (): Redis => {
    if (redisClient) {
        return redisClient;
    }

    const redisHost = process.env.REDIS_HOST || 'localhost';
    const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
    const redisPassword = process.env.REDIS_PASSWORD;

    redisClient = new Redis({
        host: redisHost,
        port: redisPort,
        password: redisPassword,
        retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
        },
        maxRetriesPerRequest: 3,
    });

    redisClient.on('connect', () => {
        logger.info('Redis connected successfully');
    });

    redisClient.on('error', (error) => {
        logger.error(`Redis connection error: ${error.message}`);
    });

    redisClient.on('close', () => {
        logger.warn('Redis connection closed');
    });

    return redisClient;
};

/**
 * Get Redis client instance
 */
export const getRedisClient = (): Redis | null => {
    return redisClient;
};

/**
 * Close Redis connection
 */
export const closeRedis = async (): Promise<void> => {
    if (redisClient) {
        await redisClient.quit();
        redisClient = null;
        logger.info('Redis connection closed');
    }
};

/**
 * Cache helper functions
 */
export class CacheService {
    private redis: Redis;
    private defaultTTL: number;

    constructor(ttl: number = 300) {
        const client = getRedisClient();
        if (!client) {
            throw new Error('Redis client not initialized');
        }
        this.redis = client;
        this.defaultTTL = ttl; // Default 5 minutes
    }

    /**
     * Get value from cache
     */
    async get<T>(key: string): Promise<T | null> {
        try {
            const value = await this.redis.get(key);
            if (!value) return null;
            return JSON.parse(value) as T;
        } catch (error) {
            logger.error(`Cache get error for key ${key}: ${error}`);
            return null;
        }
    }

    /**
     * Set value in cache
     */
    async set(key: string, value: any, ttl?: number): Promise<void> {
        try {
            const serialized = JSON.stringify(value);
            const expiry = ttl || this.defaultTTL;
            await this.redis.setex(key, expiry, serialized);
        } catch (error) {
            logger.error(`Cache set error for key ${key}: ${error}`);
        }
    }

    /**
     * Delete value from cache
     */
    async del(key: string): Promise<void> {
        try {
            await this.redis.del(key);
        } catch (error) {
            logger.error(`Cache delete error for key ${key}: ${error}`);
        }
    }

    /**
     * Delete multiple keys matching pattern
     */
    async delPattern(pattern: string): Promise<void> {
        try {
            const keys = await this.redis.keys(pattern);
            if (keys.length > 0) {
                await this.redis.del(...keys);
                logger.info(`Deleted ${keys.length} keys matching pattern: ${pattern}`);
            }
        } catch (error) {
            logger.error(`Cache delete pattern error for ${pattern}: ${error}`);
        }
    }

    /**
     * Check if key exists
     */
    async exists(key: string): Promise<boolean> {
        try {
            const exists = await this.redis.exists(key);
            return exists === 1;
        } catch (error) {
            logger.error(`Cache exists check error for key ${key}: ${error}`);
            return false;
        }
    }

    /**
     * Increment counter
     */
    async incr(key: string, ttl?: number): Promise<number> {
        try {
            const value = await this.redis.incr(key);
            if (ttl && value === 1) {
                await this.redis.expire(key, ttl);
            }
            return value;
        } catch (error) {
            logger.error(`Cache increment error for key ${key}: ${error}`);
            return 0;
        }
    }

    /**
     * Get cache statistics
     */
    async getStats(): Promise<{
        connected: boolean;
        keyCount: number;
        memoryUsed: string;
    }> {
        try {
            const info = await this.redis.info('memory');
            const dbSize = await this.redis.dbsize();

            const memoryMatch = info.match(/used_memory_human:(.+)/);
            const memoryUsed = memoryMatch ? memoryMatch[1].trim() : 'unknown';

            return {
                connected: this.redis.status === 'ready',
                keyCount: dbSize,
                memoryUsed,
            };
        } catch (error) {
            logger.error(`Error getting cache stats: ${error}`);
            return {
                connected: false,
                keyCount: 0,
                memoryUsed: 'unknown',
            };
        }
    }
}

export default CacheService;
