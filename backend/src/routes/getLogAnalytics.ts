import express from 'express';
import { Request, Response } from 'express';
import { LinuxLogModel } from '../models/LinuxLogModel';

const router = express.Router();

router.get('/getLogAnalytics', async (req: Request, res: Response) => {
  try {
    const logs = await LinuxLogModel.find({}).sort({ timestamp: -1 }).limit(1000); // Fetch the latest 10 logs

    const rows = logs.map(log => ({
      id: log._id,
      timeStamp: log.timestamp.toUTCString(),
      severity: log.severity,
      users: log.users ? log.users : "N/A",
      rawLine: log.rawLine,
      message: log.message,
      uploadDate: log.uploadDate ? log.uploadDate.toISOString() : null,
      analyzed: log.analyzed,
      EventId: log.eventId,
      logType: log.logType,
    }));

    res.json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
});



export default router;



