import express from 'express';
import { Request, Response } from 'express';
import UnifiedLogModel from '../models/UnifiedLogModel';

const router = express.Router();

router.get('/severityInfo', async (req: Request, res: Response) => {
  try {

    const info = [0, 0, 0, 0, 0, 0, 0];
    const warning = [0, 0, 0, 0, 0, 0, 0];
    const error = [0, 0, 0, 0, 0, 0, 0];
    const critical = [0, 0, 0, 0, 0, 0, 0];

    // Get monthly data for the last 7 months
    for (let i = 0; i < 7; i++) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthStart.getMonth() + 1);
      monthEnd.setDate(0);
      monthEnd.setHours(23, 59, 59, 999);

      info[6 - i] = await UnifiedLogModel.countDocuments({
        severity: 'INFO',
        timestamp: { $gte: monthStart, $lte: monthEnd }
      });

      warning[6 - i] = await UnifiedLogModel.countDocuments({
        severity: 'WARNING',
        timestamp: { $gte: monthStart, $lte: monthEnd }
      });

      error[6 - i] = await UnifiedLogModel.countDocuments({
        severity: 'ERROR',
        timestamp: { $gte: monthStart, $lte: monthEnd }
      });

      critical[6 - i] = await UnifiedLogModel.countDocuments({
        severity: 'CRITICAL',
        timestamp: { $gte: monthStart, $lte: monthEnd }
      });
    }

    // Prepare response with total counts and monthly data
    res.json({
      info,
      warning,
      error,
      critical,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
});



export default router;



