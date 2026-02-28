import express, { Request, Response } from 'express';
import UnifiedLogModel from '../models/UnifiedLogModel';
import { asyncHandler } from '../middleware/errorHandler';
import { ValidationError } from '../middleware/errors';
import logger from '../utils/logger';

const router = express.Router();

/**
 * GET /api/logs/search
 * Advanced search with text search, severity, date range, logType, OS filters
 * Query params: q, severity, logType, os, startDate, endDate, page, limit, sortBy, sortOrder
 */
router.get('/logs/search', asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.auth.userId;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
  const skip = (page - 1) * limit;

  // Build filter query
  const filter: any = { ownerId };

  // Text search
  const q = req.query.q as string;
  if (q && q.trim()) {
    filter.$text = { $search: q.trim() };
  }

  // Severity filter (comma-separated)
  const severity = req.query.severity as string;
  if (severity) {
    const severities = severity.split(',').map(s => s.trim().toUpperCase());
    const validSeverities = ['INFO', 'WARNING', 'ERROR', 'CRITICAL'];
    const filtered = severities.filter(s => validSeverities.includes(s));
    if (filtered.length > 0) {
      filter.severity = { $in: filtered };
    }
  }

  // Log type filter (comma-separated)
  const logType = req.query.logType as string;
  if (logType) {
    const logTypes = logType.split(',').map(t => t.trim().toUpperCase());
    filter.logType = { $in: logTypes };
  }

  // Operating system filter
  const os = req.query.os as string;
  if (os && ['Linux', 'Windows'].includes(os)) {
    filter.operatingSystem = os;
  }

  // Date range filter
  const startDate = req.query.startDate as string;
  const endDate = req.query.endDate as string;
  if (startDate || endDate) {
    filter.timestamp = {};
    if (startDate) {
      const start = new Date(startDate);
      if (!isNaN(start.getTime())) {
        filter.timestamp.$gte = start;
      }
    }
    if (endDate) {
      const end = new Date(endDate);
      if (!isNaN(end.getTime())) {
        filter.timestamp.$lte = end;
      }
    }
    if (Object.keys(filter.timestamp).length === 0) {
      delete filter.timestamp;
    }
  }

  // Sorting
  const sortBy = (req.query.sortBy as string) || 'timestamp';
  const sortOrder = (req.query.sortOrder as string) === 'asc' ? 1 : -1;
  const allowedSortFields = ['timestamp', 'severity', 'logType', 'uploadDate'];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'timestamp';

  const [logs, total] = await Promise.all([
    UnifiedLogModel.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .select('-__v')
      .lean(),
    UnifiedLogModel.countDocuments(filter)
  ]);

  res.json({
    data: logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + logs.length < total,
    },
    filters: {
      q: q || null,
      severity: severity || null,
      logType: logType || null,
      os: os || null,
      startDate: startDate || null,
      endDate: endDate || null,
    },
  });
}));

/**
 * GET /api/logs/export
 * Export logs as CSV or JSON
 * Query params: format (csv|json), plus all search filters above
 */
router.get('/logs/export', asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.auth.userId;
  const format = (req.query.format as string) || 'csv';

  // Build filter (same as search)
  const filter: any = { ownerId };

  const severity = req.query.severity as string;
  if (severity) {
    filter.severity = { $in: severity.split(',').map(s => s.trim().toUpperCase()) };
  }

  const logType = req.query.logType as string;
  if (logType) {
    filter.logType = { $in: logType.split(',').map(t => t.trim().toUpperCase()) };
  }

  const os = req.query.os as string;
  if (os && ['Linux', 'Windows'].includes(os)) {
    filter.operatingSystem = os;
  }

  const startDate = req.query.startDate as string;
  const endDate = req.query.endDate as string;
  if (startDate || endDate) {
    filter.timestamp = {};
    if (startDate) filter.timestamp.$gte = new Date(startDate);
    if (endDate) filter.timestamp.$lte = new Date(endDate);
  }

  // Limit export to 10000 records for performance
  const logs = await UnifiedLogModel.find(filter)
    .sort({ timestamp: -1 })
    .limit(10000)
    .select('-__v -ownerId')
    .lean();

  if (format === 'json') {
    const filename = `logs-export-${new Date().toISOString().split('T')[0]}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.json(logs);
  }

  // Default: CSV export
  const filename = `logs-export-${new Date().toISOString().split('T')[0]}.csv`;
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  // CSV header
  const csvHeaders = [
    'Timestamp', 'Severity', 'Log Type', 'OS', 'Event ID',
    'Message', 'Source', 'Task Category', 'Upload Date', 'Analyzed'
  ].join(',');

  const csvRows = logs.map(log => {
    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };
    return [
      escapeCsv(log.timestamp),
      escapeCsv(log.severity),
      escapeCsv(log.logType),
      escapeCsv(log.operatingSystem),
      escapeCsv(log.eventId),
      escapeCsv(log.message),
      escapeCsv(log.source),
      escapeCsv(log.taskCategory),
      escapeCsv(log.uploadDate),
      escapeCsv(log.analyzed),
    ].join(',');
  });

  const csvContent = [csvHeaders, ...csvRows].join('\n');
  res.send(csvContent);
}));

/**
 * GET /api/logs/:id
 * Get a single log entry by ID
 */
router.get('/logs/:id', asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.auth.userId;
  const logId = req.params.id;

  const log = await UnifiedLogModel.findOne({ _id: logId, ownerId }).select('-__v').lean();

  if (!log) {
    throw new ValidationError('Log entry not found');
  }

  res.json(log);
}));

/**
 * DELETE /api/logs/:id
 * Delete a single log entry
 */
router.delete('/logs/:id', asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.auth.userId;
  const logId = req.params.id;

  const result = await UnifiedLogModel.findOneAndDelete({ _id: logId, ownerId });

  if (!result) {
    throw new ValidationError('Log entry not found');
  }

  logger.info(`User ${ownerId} deleted log ${logId}`);
  res.json({ status: 'success', message: 'Log entry deleted successfully' });
}));

/**
 * DELETE /api/logs
 * Delete multiple logs (bulk delete)
 * Body: { ids: string[] } or { deleteAll: true, filters: {...} }
 */
router.delete('/logs', asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.auth.userId;
  const { ids, deleteAll, filters } = req.body;

  if (deleteAll) {
    // Delete all logs matching filters for this user
    const filter: any = { ownerId };
    if (filters?.severity) filter.severity = { $in: filters.severity };
    if (filters?.logType) filter.logType = { $in: filters.logType };
    if (filters?.os) filter.operatingSystem = filters.os;

    const result = await UnifiedLogModel.deleteMany(filter);
    logger.info(`User ${ownerId} bulk deleted ${result.deletedCount} logs`);
    return res.json({
      status: 'success',
      message: `${result.deletedCount} log entries deleted`,
      deletedCount: result.deletedCount,
    });
  }

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw new ValidationError('Please provide an array of log IDs to delete');
  }

  if (ids.length > 1000) {
    throw new ValidationError('Cannot delete more than 1000 logs at once');
  }

  const result = await UnifiedLogModel.deleteMany({
    _id: { $in: ids },
    ownerId,
  });

  logger.info(`User ${ownerId} deleted ${result.deletedCount} logs`);
  res.json({
    status: 'success',
    message: `${result.deletedCount} log entries deleted`,
    deletedCount: result.deletedCount,
  });
}));

export default router;
