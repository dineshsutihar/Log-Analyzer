import express from "express";
import { Request, Response } from "express";
import UnifiedLogModel from "../models/UnifiedLogModel";
import { asyncHandler } from "../middleware/errorHandler";

const router = express.Router();

/**
 * GET /api/health-score
 *
 * Computes a 0–100 system health score based on the user's logs.
 *
 * Scoring factors:
 *   1. Error Rate (40% weight) — ratio of ERROR + CRITICAL to total logs
 *   2. Trend Direction (25% weight) — is the error rate improving or worsening?
 *   3. Critical Density (20% weight) — proportion of CRITICAL vs total errors
 *   4. Log Recency (15% weight) — are logs being actively monitored?
 *
 * Also returns:
 *   - severity breakdown (counts)
 *   - daily health trend (last 30 days)
 *   - top error sources (most frequent error messages)
 *   - actionable recommendations
 */
router.get(
  "/health-score",
  asyncHandler(async (req: Request, res: Response) => {
    const ownerId = req.auth.userId;
    const now = new Date();

    // Time windows
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const prev7d = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000); // 7-14 days ago

    // --- 1. Severity Breakdown (all time & time windows) ---
    const [severityCounts, recentSeverity, prevWeekSeverity, last24hCounts] =
      await Promise.all([
        // All-time counts
        UnifiedLogModel.aggregate([
          { $match: { ownerId } },
          { $group: { _id: "$severity", count: { $sum: 1 } } },
        ]),
        // Last 7 days counts
        UnifiedLogModel.aggregate([
          { $match: { ownerId, timestamp: { $gte: last7d } } },
          { $group: { _id: "$severity", count: { $sum: 1 } } },
        ]),
        // Previous week (7-14 days ago)
        UnifiedLogModel.aggregate([
          {
            $match: {
              ownerId,
              timestamp: { $gte: prev7d, $lt: last7d },
            },
          },
          { $group: { _id: "$severity", count: { $sum: 1 } } },
        ]),
        // Last 24h counts
        UnifiedLogModel.aggregate([
          { $match: { ownerId, timestamp: { $gte: last24h } } },
          { $group: { _id: "$severity", count: { $sum: 1 } } },
        ]),
      ]);

    // Helper to extract count by severity
    const getCount = (
      agg: { _id: string; count: number }[],
      severity: string
    ) => agg.find((a) => a._id === severity)?.count || 0;

    const totalAll =
      getCount(severityCounts, "INFO") +
      getCount(severityCounts, "WARNING") +
      getCount(severityCounts, "ERROR") +
      getCount(severityCounts, "CRITICAL");

    const breakdown = {
      info: getCount(severityCounts, "INFO"),
      warning: getCount(severityCounts, "WARNING"),
      error: getCount(severityCounts, "ERROR"),
      critical: getCount(severityCounts, "CRITICAL"),
      total: totalAll,
    };

    // If no logs at all, return a neutral state
    if (totalAll === 0) {
      res.json({
        score: null,
        status: "no-data",
        breakdown: { info: 0, warning: 0, error: 0, critical: 0, total: 0 },
        trend: [],
        trendDirection: "neutral",
        topErrors: [],
        recommendations: [
          "Upload your first log file to get a system health assessment.",
        ],
        last24h: { info: 0, warning: 0, error: 0, critical: 0, total: 0 },
      });
      return;
    }

    // --- 2. Error Rate Score (40% weight) ---
    // Lower error rate = higher score
    const errorCount = breakdown.error + breakdown.critical;
    const errorRate = errorCount / totalAll;
    // Map: 0% errors → 100, 5% → 80, 15% → 50, 30%+ → 10
    let errorRateScore: number;
    if (errorRate <= 0.01) errorRateScore = 100;
    else if (errorRate <= 0.05) errorRateScore = 100 - (errorRate / 0.05) * 20;
    else if (errorRate <= 0.15)
      errorRateScore = 80 - ((errorRate - 0.05) / 0.1) * 30;
    else if (errorRate <= 0.3)
      errorRateScore = 50 - ((errorRate - 0.15) / 0.15) * 40;
    else errorRateScore = Math.max(0, 10 - (errorRate - 0.3) * 30);

    // --- 3. Trend Direction Score (25% weight) ---
    const recentErrors =
      getCount(recentSeverity, "ERROR") + getCount(recentSeverity, "CRITICAL");
    const recentTotal = recentSeverity.reduce(
      (sum: number, a: { count: number }) => sum + a.count,
      0
    );
    const prevErrors =
      getCount(prevWeekSeverity, "ERROR") +
      getCount(prevWeekSeverity, "CRITICAL");
    const prevTotal = prevWeekSeverity.reduce(
      (sum: number, a: { count: number }) => sum + a.count,
      0
    );

    const recentErrorRate = recentTotal > 0 ? recentErrors / recentTotal : 0;
    const prevErrorRate = prevTotal > 0 ? prevErrors / prevTotal : 0;

    let trendDirection: "improving" | "stable" | "degrading";
    let trendScore: number;

    if (prevTotal === 0 && recentTotal === 0) {
      trendDirection = "stable";
      trendScore = 70;
    } else if (prevTotal === 0) {
      trendDirection = recentErrorRate > 0.1 ? "degrading" : "stable";
      trendScore = recentErrorRate > 0.1 ? 40 : 70;
    } else {
      const rateChange = recentErrorRate - prevErrorRate;
      if (rateChange < -0.02) {
        trendDirection = "improving";
        trendScore = Math.min(100, 80 + Math.abs(rateChange) * 200);
      } else if (rateChange > 0.02) {
        trendDirection = "degrading";
        trendScore = Math.max(0, 60 - rateChange * 200);
      } else {
        trendDirection = "stable";
        trendScore = 70;
      }
    }

    // --- 4. Critical Density Score (20% weight) ---
    // High ratio of CRITICAL among errors is very bad
    const criticalRatio = errorCount > 0 ? breakdown.critical / errorCount : 0;
    const criticalScore = Math.max(0, 100 - criticalRatio * 150);

    // --- 5. Log Recency Score (15% weight) ---
    // Actively monitored systems score higher
    const last24hTotal = last24hCounts.reduce(
      (sum: number, a: { count: number }) => sum + a.count,
      0
    );
    let recencyScore: number;
    if (last24hTotal > 0) recencyScore = 100;
    else {
      const latestLog = await UnifiedLogModel.findOne({ ownerId })
        .sort({ timestamp: -1 })
        .select("timestamp")
        .lean();
      if (!latestLog) {
        recencyScore = 0;
      } else {
        const daysSinceLastLog = Math.floor(
          (now.getTime() - new Date(latestLog.timestamp).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        if (daysSinceLastLog <= 1) recencyScore = 100;
        else if (daysSinceLastLog <= 3) recencyScore = 80;
        else if (daysSinceLastLog <= 7) recencyScore = 60;
        else if (daysSinceLastLog <= 30) recencyScore = 30;
        else recencyScore = 10;
      }
    }

    // --- Weighted Score ---
    const score = Math.round(
      errorRateScore * 0.4 +
        trendScore * 0.25 +
        criticalScore * 0.2 +
        recencyScore * 0.15
    );

    // Status label
    let status: string;
    if (score >= 90) status = "excellent";
    else if (score >= 75) status = "good";
    else if (score >= 50) status = "fair";
    else if (score >= 25) status = "poor";
    else status = "critical";

    // --- 6. Daily Health Trend (last 30 days) ---
    const dailyTrend = await UnifiedLogModel.aggregate([
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
    ]);

    // Build 30-day array with daily scores
    const trend: {
      date: string;
      score: number;
      errors: number;
      total: number;
    }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];

      const dayLogs = dailyTrend.filter(
        (r: { _id: { date: string } }) => r._id.date === dateStr
      );
      const dayTotal = dayLogs.reduce(
        (s: number, r: { count: number }) => s + r.count,
        0
      );
      const dayErrors = dayLogs
        .filter(
          (r: { _id: { severity: string } }) =>
            r._id.severity === "ERROR" || r._id.severity === "CRITICAL"
        )
        .reduce((s: number, r: { count: number }) => s + r.count, 0);

      const dayErrorRate = dayTotal > 0 ? dayErrors / dayTotal : 0;
      const dayScore =
        dayTotal > 0 ? Math.round(Math.max(0, 100 - dayErrorRate * 200)) : -1; // -1 = no data

      trend.push({ date: dateStr, score: dayScore, errors: dayErrors, total: dayTotal });
    }

    // --- 7. Top Error Sources ---
    const topErrors = await UnifiedLogModel.aggregate([
      {
        $match: {
          ownerId,
          severity: { $in: ["ERROR", "CRITICAL"] },
          timestamp: { $gte: last30d },
        },
      },
      {
        $group: {
          _id: {
            // Group by first 100 chars of message for clustering
            message: { $substr: ["$message", 0, 100] },
            severity: "$severity",
          },
          count: { $sum: 1 },
          lastSeen: { $max: "$timestamp" },
          source: { $first: "$source" },
          logType: { $first: "$logType" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // --- 8. Recommendations ---
    const recommendations: string[] = [];

    if (breakdown.critical > 0) {
      recommendations.push(
        `You have ${breakdown.critical} critical log entries. Review and resolve these immediately.`
      );
    }
    if (trendDirection === "degrading") {
      recommendations.push(
        "Error rate is increasing compared to last week. Investigate recent changes."
      );
    }
    if (breakdown.error > breakdown.total * 0.1) {
      recommendations.push(
        `Error rate is ${(errorRate * 100).toFixed(1)}% — above the 10% threshold. Check top error sources.`
      );
    }
    if (breakdown.warning > breakdown.total * 0.3) {
      recommendations.push(
        "High warning volume detected. Warnings often precede errors — investigate proactively."
      );
    }
    if (last24hTotal === 0 && totalAll > 0) {
      recommendations.push(
        "No logs received in the last 24 hours. Ensure your log pipeline is active."
      );
    }
    if (trendDirection === "improving") {
      recommendations.push(
        "Error rate is trending down — great progress! Keep monitoring."
      );
    }
    if (recommendations.length === 0) {
      recommendations.push(
        "System health looks stable. Continue regular monitoring."
      );
    }

    // --- 9. 24h snapshot ---
    const last24hBreakdown = {
      info: getCount(last24hCounts, "INFO"),
      warning: getCount(last24hCounts, "WARNING"),
      error: getCount(last24hCounts, "ERROR"),
      critical: getCount(last24hCounts, "CRITICAL"),
      total: last24hTotal,
    };

    res.json({
      score,
      status,
      breakdown,
      trend,
      trendDirection,
      topErrors: topErrors.map(
        (e: {
          _id: { message: string; severity: string };
          count: number;
          lastSeen: Date;
          source: string;
          logType: string;
        }) => ({
          message: e._id.message,
          severity: e._id.severity,
          count: e.count,
          lastSeen: e.lastSeen,
          source: e.source,
          logType: e.logType,
        })
      ),
      recommendations,
      last24h: last24hBreakdown,
    });
  })
);

export default router;
