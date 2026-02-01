import { z } from 'zod';

/**
 * Upload validation schema
 */
export const uploadSchema = z.object({
    body: z.object({
        source: z.string().optional(),
    }),
    file: z.object({
        originalname: z.string(),
        mimetype: z.enum(['text/plain', 'text/csv', 'application/octet-stream']),
        size: z.number().max(50 * 1024 * 1024), // 50MB max
    }).optional(),
});

/**
 * Log query validation schema
 */
export const logQuerySchema = z.object({
    query: z.object({
        page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
        limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 50)),
        severity: z.enum(['INFO', 'WARNING', 'ERROR', 'CRITICAL']).optional(),
        logType: z.string().optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        search: z.string().optional(),
    }),
});

/**
 * Log ID parameter validation
 */
export const logIdSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId'),
    }),
});

/**
 * Chat request validation
 */
export const chatSchema = z.object({
    body: z.object({
        logId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid log ID'),
        userText: z.string().max(500).optional(),
    }),
});

/**
 * Bulk delete validation
 */
export const bulkDeleteSchema = z.object({
    body: z.object({
        logIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).min(1).max(100),
    }),
});

/**
 * Date range validation
 */
export const dateRangeSchema = z.object({
    query: z.object({
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
    }),
}).refine(
    (data) => new Date(data.query.startDate) <= new Date(data.query.endDate),
    {
        message: 'Start date must be before or equal to end date',
        path: ['query', 'startDate'],
    }
);
