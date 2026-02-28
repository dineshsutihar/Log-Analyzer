import express, { Request, Response } from 'express';
import UnifiedLogModel from '../models/UnifiedLogModel';
import { cacheMiddleware } from '../middleware/cacheMiddleware';
import { asyncHandler } from '../middleware/errorHandler';
import logger from '../utils/logger';

const app = express.Router();

// Cache for 5 minutes (300 seconds)
const logsCacheMiddleware = cacheMiddleware(300);

app.get('/logs', logsCacheMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const skip = (page - 1) * limit;
  const ownerId = req.auth.userId;

  const [logs, total] = await Promise.all([
    UnifiedLogModel.find({ ownerId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v')
      .lean(),
    UnifiedLogModel.countDocuments({ ownerId })
  ]);

  res.json({
    data: logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + logs.length < total
    }
  });
}));

app.get('/winlogs', logsCacheMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.auth.userId;
  const logs = await UnifiedLogModel.find({
    ownerId,
    operatingSystem: 'Windows'
  })
    .sort({ timestamp: -1 })
    .limit(100)
    .select('-__v')
    .lean();

  res.json(logs);
}));

app.get('/linlogs', logsCacheMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.auth.userId;
  const logs = await UnifiedLogModel.find({
    ownerId,
    operatingSystem: 'Linux'
  })
    .sort({ timestamp: -1 })
    .limit(100)
    .select('-__v')
    .lean();

  res.json(logs);
}));

app.get('/kernellogs', logsCacheMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.auth.userId;
  const logs = await UnifiedLogModel.find({
    ownerId,
    operatingSystem: 'Linux',
    logType: 'KERNEL'
  })
    .sort({ timestamp: -1 })
    .limit(100)
    .select('-__v')
    .lean();

  res.json(logs);
}));

app.get('/syslogs', logsCacheMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.auth.userId;
  const logs = await UnifiedLogModel.find({
    ownerId,
    operatingSystem: 'Linux',
    logType: 'SYSLOG'
  })
    .sort({ timestamp: -1 })
    .limit(100)
    .select('-__v')
    .lean();

  res.json(logs);
}));

app.get('/authlogs', logsCacheMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.auth.userId;
  const logs = await UnifiedLogModel.find({
    ownerId,
    operatingSystem: 'Linux',
    logType: 'AUTH'
  })
    .sort({ timestamp: -1 })
    .limit(100)
    .select('-__v')
    .lean();

  res.json(logs);
}));

app.get('/unknownlogs', logsCacheMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.auth.userId;
  const logs = await UnifiedLogModel.find({
    ownerId,
    operatingSystem: 'Linux',
    logType: { $regex: 'UNKNOWN' }
  })
    .sort({ timestamp: -1 })
    .limit(100)
    .select('-__v')
    .lean();

  res.json(logs);
}));

export default app;

