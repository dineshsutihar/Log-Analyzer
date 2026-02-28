import express from "express";
import { Request, Response } from "express";
import UnifiedLogModel from "../models/UnifiedLogModel";
import { asyncHandler } from "../middleware/errorHandler";

const router = express.Router();

router.get("/getLogAnalytics", asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.auth; 
  const logs = await UnifiedLogModel.find({ ownerId: userId })
    .sort({ timestamp: -1 })
    .limit(1000);

  const rows = logs.map((log) => ({
    id: log._id,
    timeStamp: log.timestamp.toUTCString(),
    severity: log.severity,
    users: log.users ? log.users : "guest",
    rawLine: log.rawLine,
    message: log.message,
    uploadDate: log.uploadDate ? log.uploadDate.toISOString() : null,
    analyzed: log.analyzed,
    EventId: log.eventId,
    logType: log.logType,
  }));
  res.json(rows);
}));

export default router;
