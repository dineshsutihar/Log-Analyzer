import UnifiedLogModel from '../models/UnifiedLogModel';
import logger from '../utils/logger';

/**
 * Create database indexes for optimized queries
 */
export const createIndexes = async (): Promise<void> => {
    try {
        logger.info('Creating database indexes...');

        // Compound index for user logs sorted by timestamp
        await UnifiedLogModel.collection.createIndex(
            { ownerId: 1, timestamp: -1 },
            { name: 'owner_timestamp_idx' }
        );

        // Index for severity filtering
        await UnifiedLogModel.collection.createIndex(
            { severity: 1, timestamp: -1 },
            { name: 'severity_timestamp_idx' }
        );

        // Compound index for log type and owner
        await UnifiedLogModel.collection.createIndex(
            { logType: 1, ownerId: 1 },
            { name: 'logtype_owner_idx' }
        );

        // Index for analyzed logs
        await UnifiedLogModel.collection.createIndex(
            { analyzed: 1, uploadDate: -1 },
            { name: 'analyzed_upload_idx' }
        );

        // Text index for message search
        await UnifiedLogModel.collection.createIndex(
            { message: 'text', rawLine: 'text' },
            {
                name: 'text_search_idx',
                weights: {
                    message: 2,
                    rawLine: 1,
                },
            }
        );

        // Index for upload date (useful for retention policies)
        await UnifiedLogModel.collection.createIndex(
            { uploadDate: 1 },
            { name: 'upload_date_idx' }
        );

        // Compound index for common query patterns
        await UnifiedLogModel.collection.createIndex(
            { ownerId: 1, severity: 1, logType: 1, timestamp: -1 },
            { name: 'common_query_idx' }
        );

        logger.info('Database indexes created successfully');
    } catch (error) {
        logger.error(`Error creating indexes: ${error}`);
        throw error;
    }
};

/**
 * List all indexes on the collection
 */
export const listIndexes = async (): Promise<void> => {
    try {
        const indexes = await UnifiedLogModel.collection.listIndexes().toArray();
        logger.info('Current indexes:');
        indexes.forEach((index) => {
            logger.info(`  - ${index.name}: ${JSON.stringify(index.key)}`);
        });
    } catch (error) {
        logger.error(`Error listing indexes: ${error}`);
    }
};
