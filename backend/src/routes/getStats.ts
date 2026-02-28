import express from "express";
import { Request, Response } from "express";
import { LinuxLogModel } from "../models/LinuxLogModel";
import UnifiedLogModel from "../models/UnifiedLogModel";
import { asyncHandler } from "../middleware/errorHandler";

const router = express.Router();

router.get("/stats", asyncHandler(async (req: Request, res: Response) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90); // 90 days ago

    const totalLogsAgg = await UnifiedLogModel.aggregate([
      {
        $match: { timestamp: { $gte: startDate }, ownerId: req.auth.userId },
      },
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
          "_id.day": 1,
        },
      },
    ]);

    const errorLogsAgg = await UnifiedLogModel.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
          severity: { $in: ["ERROR"] },
          ownerId: req.auth.userId,
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
          "_id.day": 1,
        },
      },
    ]);

    const warningLogsAgg = await UnifiedLogModel.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
          severity: { $in: ["WARNING"] },
          ownerId: req.auth.userId,
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
          "_id.day": 1,
        },
      },
    ]);

    // Format Helper to build a 90 days array
    const totalLogsData = buildDailyArray(totalLogsAgg, startDate);
    const errorLogsData = buildDailyArray(errorLogsAgg, startDate);
    const warningLogsData = buildDailyArray(warningLogsAgg, startDate);

    // sum up total logs
    const totalLogsSum = totalLogsData.reduce((acc, count) => acc + count, 0);
    const errorLogsSum = errorLogsData.reduce((acc, count) => acc + count, 0);
    const warningLogsSum = warningLogsData.reduce(
      (acc, count) => acc + count,
      0
    );

    //compute trends (returns { direction, percentage })
    const totalLogsTrend = computeTrend(totalLogsData);
    const errorLogsTrend = computeTrend(errorLogsData);
    const warningLogsTrend = computeTrend(warningLogsData);

    res.json([
      {
        title: "Total Logs",
        value: totalLogsSum,
        interval: "Last 90 days",
        trend: totalLogsTrend.direction,
        trendPercentage: totalLogsTrend.percentage,
        data: totalLogsData,
      },
      {
        title: "Error Count",
        value: errorLogsSum,
        interval: "Last 90 days",
        trend: errorLogsTrend.direction,
        trendPercentage: errorLogsTrend.percentage,
        data: errorLogsData,
      },
      {
        title: "Warning Count",
        value: warningLogsSum,
        interval: "Last 90 days",
        trend: warningLogsTrend.direction,
        trendPercentage: warningLogsTrend.percentage,
        data: warningLogsData,
      },
    ]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
}));

function buildDailyArray(
  aggResults: {
    _id: { year: number; month: number; day: number };
    count: number;
  }[],
  startDate: Date
): number[] {
  const daysCount = 90;
  const dailyArray = new Array(daysCount).fill(0);

  for (const doc of aggResults) {
    const { year, month, day } = doc._id;
    const thisDate = new Date(year, month - 1, day); // month is 0-indexed
    const index = Math.floor(
      (thisDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (index >= 0 && index < daysCount) {
      dailyArray[index] = doc.count;
    }
  }

  return dailyArray;
}

function computeTrend(data: number[]): { direction: string; percentage: string } {
  if (data.length < 14) return { direction: "neutral", percentage: "0%" };

  // Compare last 7 days avg vs previous 7 days avg for stable trend
  const recent7 = data.slice(-7);
  const prev7 = data.slice(-14, -7);

  const recentAvg = recent7.reduce((a, b) => a + b, 0) / 7;
  const prevAvg = prev7.reduce((a, b) => a + b, 0) / 7;

  if (prevAvg === 0 && recentAvg === 0) {
    return { direction: "neutral", percentage: "0%" };
  }

  if (prevAvg === 0) {
    return { direction: "up", percentage: "+100%" };
  }

  const change = ((recentAvg - prevAvg) / prevAvg) * 100;
  const sign = change >= 0 ? "+" : "";
  const percentage = `${sign}${Math.round(change)}%`;

  let direction: string;
  if (change > 5) direction = "up";
  else if (change < -5) direction = "down";
  else direction = "neutral";

  return { direction, percentage };
}

export default router;
