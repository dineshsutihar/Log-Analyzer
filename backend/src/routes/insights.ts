import express from "express";
import { Request, Response } from "express";
import UnifiedLogModel from "../models/UnifiedLogModel";
import { asyncHandler } from "../middleware/errorHandler";

const router = express.Router();

/**
 * GET /api/insights
 *
 * Automated log intelligence engine.
 * Detects patterns, anomalies, and generates actionable insights.
 *
 * Returns:
 *   - anomalies: time periods with unusual error spikes
 *   - recurring: most frequently repeated errors (noise detection)
 *   - errorClusters: errors grouped by source/logType
 *   - timeline: hourly error distribution (detect peak failure hours)
 *   - summary: natural language summary of system state
 */
router.get(
  "/insights",
  asyncHandler(async (req: Request, res: Response) => {
    const ownerId = req.auth.userId;
    const now = new Date();
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Run all aggregations in parallel
    const [
      hourlyDist,
      recurringErrors,
      errorsBySource,
      errorsByLogType,
      dailyVolume,
      recentBurst,
      severityOverTime,
    ] = await Promise.all([
      // 1. Hourly error distribution (last 7 days) — detect peak failure hours
      UnifiedLogModel.aggregate([
        {
          $match: {
            ownerId,
            severity: { $in: ["ERROR", "CRITICAL"] },
            timestamp: { $gte: last7d },
          },
        },
        {
          $group: {
            _id: { hour: { $hour: "$timestamp" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.hour": 1 } },
      ]),

      // 2. Recurring errors — top 10 repeated error messages
      UnifiedLogModel.aggregate([
        {
          $match: {
            ownerId,
            severity: { $in: ["ERROR", "CRITICAL"] },
            timestamp: { $gte: last30d },
          },
        },
        {
          $group: {
            _id: { $substr: ["$message", 0, 120] },
            count: { $sum: 1 },
            severity: { $first: "$severity" },
            lastSeen: { $max: "$timestamp" },
            firstSeen: { $min: "$timestamp" },
            logType: { $first: "$logType" },
            sampleId: { $first: "$_id" },
          },
        },
        { $match: { count: { $gte: 2 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // 3. Errors grouped by source
      UnifiedLogModel.aggregate([
        {
          $match: {
            ownerId,
            severity: { $in: ["ERROR", "CRITICAL"] },
            timestamp: { $gte: last30d },
          },
        },
        {
          $group: {
            _id: "$source",
            count: { $sum: 1 },
            criticalCount: {
              $sum: { $cond: [{ $eq: ["$severity", "CRITICAL"] }, 1, 0] },
            },
            lastSeen: { $max: "$timestamp" },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // 4. Errors by log type
      UnifiedLogModel.aggregate([
        {
          $match: {
            ownerId,
            severity: { $in: ["ERROR", "CRITICAL"] },
            timestamp: { $gte: last30d },
          },
        },
        {
          $group: {
            _id: "$logType",
            count: { $sum: 1 },
            criticalCount: {
              $sum: { $cond: [{ $eq: ["$severity", "CRITICAL"] }, 1, 0] },
            },
          },
        },
        { $sort: { count: -1 } },
      ]),

      // 5. Daily volume (last 30 days) — for anomaly detection
      UnifiedLogModel.aggregate([
        { $match: { ownerId, timestamp: { $gte: last30d } } },
        {
          $group: {
            _id: {
              date: {
                $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
              },
              severity: "$severity",
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.date": 1 } },
      ]),

      // 6. Burst detection — error counts per 4-hour window (last 7 days)
      UnifiedLogModel.aggregate([
        {
          $match: {
            ownerId,
            severity: { $in: ["ERROR", "CRITICAL"] },
            timestamp: { $gte: last7d },
          },
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
              },
              window: {
                $floor: { $divide: [{ $hour: "$timestamp" }, 4] },
              },
            },
            count: { $sum: 1 },
            messages: { $push: { $substr: ["$message", 0, 80] } },
          },
        },
        { $sort: { "_id.date": 1, "_id.window": 1 } },
      ]),

      // 7. Severity trend over time (daily, last 30 days)
      UnifiedLogModel.aggregate([
        { $match: { ownerId, timestamp: { $gte: last30d } } },
        {
          $group: {
            _id: {
              date: {
                $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
              },
            },
            total: { $sum: 1 },
            errors: {
              $sum: {
                $cond: [
                  { $in: ["$severity", ["ERROR", "CRITICAL"]] },
                  1,
                  0,
                ],
              },
            },
            warnings: {
              $sum: { $cond: [{ $eq: ["$severity", "WARNING"] }, 1, 0] },
            },
            info: {
              $sum: { $cond: [{ $eq: ["$severity", "INFO"] }, 1, 0] },
            },
          },
        },
        { $sort: { "_id.date": 1 } },
      ]),
    ]);

    // --- Process: Hourly Distribution ---
    const hourlyDistribution = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count:
        (
          hourlyDist as { _id: { hour: number }; count: number }[]
        ).find((h) => h._id.hour === i)?.count || 0,
    }));

    const peakHour = hourlyDistribution.reduce((max, h) =>
      h.count > max.count ? h : max
    );
    const quietHour = hourlyDistribution.reduce((min, h) =>
      h.count < min.count ? h : min
    );

    // --- Process: Anomaly Detection (Z-score based) ---
    // Build daily error counts, then flag days with > 2 standard deviations
    const dailyErrorMap = new Map<string, number>();
    (
      dailyVolume as { _id: { date: string; severity: string }; count: number }[]
    ).forEach((d) => {
      if (d._id.severity === "ERROR" || d._id.severity === "CRITICAL") {
        dailyErrorMap.set(
          d._id.date,
          (dailyErrorMap.get(d._id.date) || 0) + d.count
        );
      }
    });

    const dailyErrorCounts = Array.from(dailyErrorMap.values());
    const mean =
      dailyErrorCounts.length > 0
        ? dailyErrorCounts.reduce((a, b) => a + b, 0) / dailyErrorCounts.length
        : 0;
    const stdDev =
      dailyErrorCounts.length > 1
        ? Math.sqrt(
            dailyErrorCounts.reduce(
              (sum, val) => sum + Math.pow(val - mean, 2),
              0
            ) / dailyErrorCounts.length
          )
        : 0;

    const anomalies: { date: string; count: number; zScore: number }[] = [];
    if (stdDev > 0) {
      dailyErrorMap.forEach((count, date) => {
        const zScore = (count - mean) / stdDev;
        if (zScore > 1.5) {
          // Flag days 1.5+ std devs above mean
          anomalies.push({ date, count, zScore: Math.round(zScore * 10) / 10 });
        }
      });
    }
    anomalies.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // --- Process: Burst Detection ---
    const avgBurstCount =
      (recentBurst as { _id: { date: string; window: number }; count: number }[]).length > 0
        ? (recentBurst as { count: number }[]).reduce(
            (sum, b) => sum + b.count,
            0
          ) /
          (recentBurst as { count: number }[]).length
        : 0;

    const bursts = (
      recentBurst as {
        _id: { date: string; window: number };
        count: number;
        messages: string[];
      }[]
    )
      .filter((b) => b.count > avgBurstCount * 2 && b.count >= 5)
      .map((b) => ({
        date: b._id.date,
        timeWindow: `${b._id.window * 4}:00–${b._id.window * 4 + 4}:00`,
        count: b.count,
        sampleMessages: [...new Set(b.messages)].slice(0, 3),
      }))
      .slice(0, 5);

    // --- Process: Severity Timeline ---
    const severityTimeline = (
      severityOverTime as {
        _id: { date: string };
        total: number;
        errors: number;
        warnings: number;
        info: number;
      }[]
    ).map((d) => ({
      date: d._id.date,
      total: d.total,
      errors: d.errors,
      warnings: d.warnings,
      info: d.info,
    }));

    // --- Build Summary ---
    const totalErrors = dailyErrorCounts.reduce((a, b) => a + b, 0);
    const summaryParts: string[] = [];

    if (totalErrors === 0) {
      summaryParts.push("No errors detected in the last 30 days.");
    } else {
      summaryParts.push(
        `${totalErrors} error/critical events in the last 30 days.`
      );
    }

    if (anomalies.length > 0) {
      summaryParts.push(
        `${anomalies.length} anomalous day(s) detected with unusual error spikes.`
      );
    }

    if (
      (recurringErrors as { count: number }[]).length > 0 &&
      (recurringErrors as { count: number }[])[0].count >= 10
    ) {
      summaryParts.push(
        `Top recurring error appeared ${(recurringErrors as { count: number }[])[0].count} times — likely a systemic issue.`
      );
    }

    if (peakHour.count > 0) {
      summaryParts.push(
        `Peak error hour: ${peakHour.hour}:00 UTC (${peakHour.count} errors this week).`
      );
    }

    if (bursts.length > 0) {
      summaryParts.push(
        `${bursts.length} error burst(s) detected — concentrated failures in short time windows.`
      );
    }

    res.json({
      anomalies,
      bursts,
      recurring: (
        recurringErrors as {
          _id: string;
          count: number;
          severity: string;
          lastSeen: Date;
          firstSeen: Date;
          logType: string;
          sampleId: string;
        }[]
      ).map((r) => ({
        message: r._id,
        count: r.count,
        severity: r.severity,
        lastSeen: r.lastSeen,
        firstSeen: r.firstSeen,
        logType: r.logType,
        sampleId: r.sampleId,
      })),
      errorsBySource: (
        errorsBySource as {
          _id: string;
          count: number;
          criticalCount: number;
          lastSeen: Date;
        }[]
      ).map((s) => ({
        source: s._id || "Unknown",
        count: s.count,
        criticalCount: s.criticalCount,
        lastSeen: s.lastSeen,
      })),
      errorsByLogType: (
        errorsByLogType as {
          _id: string;
          count: number;
          criticalCount: number;
        }[]
      ).map((t) => ({
        logType: t._id,
        count: t.count,
        criticalCount: t.criticalCount,
      })),
      hourlyDistribution,
      severityTimeline,
      peakErrorHour: peakHour.count > 0 ? peakHour.hour : null,
      quietestHour: quietHour.count > 0 ? quietHour.hour : null,
      summary: summaryParts.join(" "),
    });
  })
);

export default router;
