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
 * POST /api/chat/query
 *
 * AI chat that searches through logs to answer user questions.
 * Unlike /chat/system (which gives system-wide aggregated context),
 * this performs a text search through actual log entries and returns
 * matching logs to the AI for context-specific answers.
 *
 * Example questions:
 *   - "Show me all authentication failures"
 *   - "What happened with service X?"
 *   - "Find logs about disk space"
 *   - "Were there any timeout errors today?"
 */
router.post(
  "/chat/query",
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

    // Extract potential search keywords from the user's question
    // Remove common question words to get the search terms
    const stopWords = new Set([
      "show", "me", "all", "the", "what", "when", "where", "why", "how",
      "find", "search", "look", "for", "any", "are", "were", "was", "is",
      "there", "about", "with", "from", "logs", "log", "entries", "entry",
      "can", "you", "please", "tell", "get", "my", "have", "has", "had",
      "do", "does", "did", "been", "being", "will", "would", "could",
      "should", "that", "this", "these", "those", "a", "an", "and", "or",
      "in", "on", "at", "to", "of", "it", "its",
    ]);

    const keywords = userText
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word: string) => word.length > 2 && !stopWords.has(word));

    // Build search query — text search on message and rawLine fields
    const searchConditions: any[] = [];

    if (keywords.length > 0) {
      const regexPattern = keywords.join("|");
      searchConditions.push({
        $or: [
          { message: { $regex: regexPattern, $options: "i" } },
          { rawLine: { $regex: regexPattern, $options: "i" } },
          { source: { $regex: regexPattern, $options: "i" } },
        ],
      });
    }

    // Also check if user is asking about a specific severity
    const severityKeywords: Record<string, string> = {
      error: "ERROR",
      errors: "ERROR",
      critical: "CRITICAL",
      warning: "WARNING",
      warnings: "WARNING",
      info: "INFO",
      fatal: "CRITICAL",
      fail: "ERROR",
      failure: "ERROR",
      failures: "ERROR",
    };

    const matchedSeverity = userText
      .toLowerCase()
      .split(/\s+/)
      .find((word: string) => severityKeywords[word]);

    if (matchedSeverity) {
      searchConditions.push({
        severity: severityKeywords[matchedSeverity],
      });
    }

    // Check for time-based queries
    const now = new Date();
    let timeFilter: Date | null = null;
    const lowerText = userText.toLowerCase();
    if (lowerText.includes("today") || lowerText.includes("24 hour")) {
      timeFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (lowerText.includes("week") || lowerText.includes("7 day")) {
      timeFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (lowerText.includes("month") || lowerText.includes("30 day")) {
      timeFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Build final query
    const query: any = { ownerId };
    if (searchConditions.length > 0) {
      query.$and = searchConditions;
    }
    if (timeFilter) {
      query.timestamp = { $gte: timeFilter };
    }

    // Find matching logs (limit to 30 for AI context)
    const matchingLogs = await UnifiedLogModel.find(query)
      .sort({ timestamp: -1 })
      .limit(30)
      .select("severity message timestamp source logType rawLine processId")
      .lean();

    // Also get total count for context
    const totalMatches = await UnifiedLogModel.countDocuments(query);

    // Build context for AI
    const contextParts: string[] = [
      "=== LOG QUERY RESULTS ===",
      "",
      `User question: "${userText}"`,
      `Matching logs found: ${totalMatches} (showing ${Math.min(totalMatches, 30)})`,
      `Search keywords extracted: [${keywords.join(", ")}]`,
      "",
    ];

    if (matchingLogs.length > 0) {
      contextParts.push("--- Matching Log Entries ---");
      matchingLogs.forEach((log: any, i: number) => {
        contextParts.push(
          `${i + 1}. [${log.severity}] [${new Date(log.timestamp).toISOString()}] ` +
          `${log.logType || "UNKNOWN"} | ${log.source || "—"} | ${log.message?.substring(0, 200) || log.rawLine?.substring(0, 200) || "No message"}`
        );
      });
    } else {
      contextParts.push(
        "No matching logs found for the given query.",
        "The user may need to rephrase their question or upload relevant logs."
      );
    }

    const logContext = contextParts.join("\n");

    const prompt =
      "You are a log analysis assistant helping users search through and understand their logs.\n" +
      "The user asked a question, and I searched their log database for relevant entries.\n\n" +
      "RULES:\n" +
      "- Answer the user's question based on the log data provided below\n" +
      "- Reference specific log entries (by number) when relevant\n" +
      "- If logs were found, summarize patterns, common issues, and provide actionable advice\n" +
      "- If no logs matched, explain what was searched for and suggest alternative queries\n" +
      "- Use markdown formatting with headers and bullet points\n" +
      "- Be concise but thorough — aim for 100-300 words\n" +
      "- Highlight severity levels and timestamps when relevant\n\n" +
      logContext;

    const response = await model.generateContent(prompt);
    const generatedText = response.response.text();

    res.json({
      response: generatedText,
      matchCount: totalMatches,
      logsReturned: matchingLogs.length,
    });
  })
);

export default router;
