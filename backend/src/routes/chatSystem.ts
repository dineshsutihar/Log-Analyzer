import express from "express";
import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import UnifiedLogModel from "../models/UnifiedLogModel";
import { asyncHandler } from "../middleware/errorHandler";

dotenv.config();

const router = express.Router();

if (!process.env.GOOGLE_API_KEY) {
  console.warn("⚠️  GOOGLE_API_KEY not set – AI chat features will be unavailable.");
}

const genAI = process.env.GOOGLE_API_KEY
  ? new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
  : null;
const model = genAI?.getGenerativeModel({ model: "gemini-2.5-flash" }) ?? null;

/**
 * POST /api/chat/system
 *
 * AI chat with full system log context.
 * Instead of analyzing a single log, this sends aggregated system state
 * to the AI so users can ask questions like:
 *   - "What's wrong with my system?"
 *   - "What caused the spike in errors yesterday?"
 *   - "How can I improve system health?"
 *   - "Summarize the last 24 hours"
 */
router.post(
  "/chat/system",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!model) {
      res.status(503).json({ error: "AI service is not configured. Set GOOGLE_API_KEY." });
      return;
    }

    const { userText } = req.body;
    const ownerId = req.auth.userId;

    if (!userText) {
      res.status(400).json({ error: "userText is required." });
      return;
    }

    const now = new Date();
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Gather system context in parallel
    const [
      severityCounts,
      recentErrors,
      totalCount,
      last24hCount,
      topSources,
      recentCritical,
    ] = await Promise.all([
      // Severity distribution
      UnifiedLogModel.aggregate([
        { $match: { ownerId } },
        { $group: { _id: "$severity", count: { $sum: 1 } } },
      ]),

      // Recent error messages (last 7 days, max 20)
      UnifiedLogModel.find({
        ownerId,
        severity: { $in: ["ERROR", "CRITICAL"] },
        timestamp: { $gte: last7d },
      })
        .sort({ timestamp: -1 })
        .limit(20)
        .select("severity message timestamp source logType rawLine")
        .lean(),

      // Total count
      UnifiedLogModel.countDocuments({ ownerId }),

      // Last 24h count
      UnifiedLogModel.countDocuments({
        ownerId,
        timestamp: { $gte: last24h },
      }),

      // Top error sources
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
            _id: "$source",
            count: { $sum: 1 },
            latestMessage: { $first: "$message" },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),

      // Recent critical events
      UnifiedLogModel.find({
        ownerId,
        severity: "CRITICAL",
        timestamp: { $gte: last7d },
      })
        .sort({ timestamp: -1 })
        .limit(5)
        .select("message timestamp source rawLine")
        .lean(),
    ]);

    // Build severity map
    const getCount = (
      agg: { _id: string; count: number }[],
      severity: string
    ) => agg.find((a) => a._id === severity)?.count || 0;

    const infoCount = getCount(severityCounts, "INFO");
    const warningCount = getCount(severityCounts, "WARNING");
    const errorCount = getCount(severityCounts, "ERROR");
    const criticalCount = getCount(severityCounts, "CRITICAL");

    // Build context string
    const contextParts: string[] = [
      "=== SYSTEM LOG ANALYSIS CONTEXT ===",
      "",
      `Total logs: ${totalCount}`,
      `Last 24h activity: ${last24hCount} logs`,
      `Severity breakdown: INFO=${infoCount}, WARNING=${warningCount}, ERROR=${errorCount}, CRITICAL=${criticalCount}`,
      `Error rate: ${totalCount > 0 ? ((errorCount + criticalCount) / totalCount * 100).toFixed(1) : 0}%`,
      "",
    ];

    if (topSources.length > 0) {
      contextParts.push("--- Top Error Sources (last 7 days) ---");
      (topSources as { _id: string; count: number; latestMessage: string }[]).forEach((src) => {
        contextParts.push(
          `  ${src._id || "Unknown"}: ${src.count} errors — "${src.latestMessage?.substring(0, 100)}"`
        );
      });
      contextParts.push("");
    }

    if (recentCritical.length > 0) {
      contextParts.push("--- Recent CRITICAL Events ---");
      recentCritical.forEach((log: any) => {
        contextParts.push(
          `  [${new Date(log.timestamp).toISOString()}] ${log.source || "unknown"}: ${log.message?.substring(0, 150)}`
        );
      });
      contextParts.push("");
    }

    if (recentErrors.length > 0) {
      contextParts.push("--- Recent Error Log Samples (last 7 days) ---");
      recentErrors.slice(0, 10).forEach((log: any) => {
        contextParts.push(
          `  [${log.severity}] [${new Date(log.timestamp).toISOString()}] ${log.logType} | ${log.message?.substring(0, 120)}`
        );
      });
      contextParts.push("");
    }

    const systemContext = contextParts.join("\n");

    // Build the prompt
    const prompt =
      "You are an expert system administrator and log analyst providing actionable intelligence.\n" +
      "You have access to the following system log data. Use it to answer the user's question.\n\n" +
      "RULES:\n" +
      "- Be specific and actionable. Reference actual log data in your answers.\n" +
      "- If you see patterns, call them out (recurring errors, time patterns, etc.)\n" +
      "- Prioritize: CRITICAL > ERROR > WARNING\n" +
      "- Suggest concrete mitigation steps when appropriate\n" +
      "- Use markdown formatting with headers and bullet points\n" +
      "- If the data is insufficient to answer, say so clearly\n" +
      "- Keep response under 400 words unless the question requires detailed analysis\n\n" +
      systemContext +
      "\n\n--- USER QUESTION ---\n" +
      userText;

    try {
      const response = await model.generateContent(prompt);
      const generatedText = response.response.text();

      res.json({ response: generatedText });
    } catch (error) {
      console.error("AI generation error:", error);
      res.status(500).json({
        error: "Failed to generate AI response. Please try again.",
      });
    }
  })
);

export default router;
