import express from 'express';
import { Request, Response } from 'express';
import { LinuxLogModel } from '../models/LinuxLogModel';

const router = express.Router();

router.get('/stats', async (req: Request, res: Response) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90); // 90 days ago

    const totalLogsAgg = await LinuxLogModel.aggregate([
      {
        $match: { timestamp: { $gte: startDate } }
      },
      {
        $group: {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' },
          },
          count: { $sum: 1 },
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
          "_id.day": 1,
        }
      }
    ]);

    const errorLogsAgg = await LinuxLogModel.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
          severity: { $in: ['ERROR'] }
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' },
          },
          count: { $sum: 1 },
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
          "_id.day": 1,
        }
      }
    ]);

    const warningLogsAgg = await LinuxLogModel.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
          severity: { $in: ['WARNING'] } // Adjust this based on your severity levels
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' },
          },
          count: { $sum: 1 },
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
          "_id.day": 1,
        }
      }
    ]);


    // Format Helper to build a 90 days array
    const totalLogsData = buildDailyArray(totalLogsAgg, startDate);
    const errorLogsData = buildDailyArray(errorLogsAgg, startDate);
    const warningLogsData = buildDailyArray(warningLogsAgg, startDate);

    // sum up total logs
    const totalLogsSum = totalLogsData.reduce((acc, count) => acc + count, 0);
    const errorLogsSum = errorLogsData.reduce((acc, count) => acc + count, 0);
    const warningLogsSum = warningLogsData.reduce((acc, count) => acc + count, 0);

    //compute tends 
    const totalLogsTend = computeTrend(totalLogsData);
    const errorLogsTend = computeTrend(errorLogsData);
    const warningLogsTend = computeTrend(warningLogsData);



    res.json([
      {
        title: "Total Logs",
        value: totalLogsSum, // e.g. "14k" or a number
        interval: "Last 90 days",
        trend: totalLogsTend, // "up", "down", or "neutral"
        data: totalLogsData, // [0, 3, 5, 2, ...] for 180 days
      },
      {
        title: "Error Count",
        value: errorLogsSum,
        interval: "Last 90 days",
        trend: errorLogsTend,
        data: errorLogsData,
      },
      {
        title: "Warning Count",
        value: warningLogsSum,
        interval: "Last 90 days",
        trend: warningLogsTend,
        data: warningLogsData,
      },
    ])



  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
});

function buildDailyArray(
  aggResults: { _id: { year: number; month: number; day: number }; count: number }[],
  startDate: Date
): number[] {
  const daysCount = 90;
  const dailyArray = new Array(daysCount).fill(0);

  for (const doc of aggResults) {
    const { year, month, day } = doc._id;
    const thisDate = new Date(year, month - 1, day); // month is 0-indexed 
    const index = Math.floor((thisDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    if (index >= 0 && index < daysCount) {
      dailyArray[index] = doc.count;
    }
  }

  return dailyArray;
}


function computeTrend(data: number[]) {
  if (data.length < 2) return "neutral";

  const recentValue = data[data.length - 1];
  const previousValue = data[data.length - 2];

  if (recentValue > previousValue) {
    return "up";
  } else if (recentValue < previousValue) {
    return "down";
  } else {
    return "neutral";
  }
}


export default router;



