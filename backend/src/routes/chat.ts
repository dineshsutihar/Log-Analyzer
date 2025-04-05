import express from 'express';
import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import UnifiedLogModel from '../models/UnifiedLogModel';

dotenv.config();

const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

if (!process.env.GOOGLE_API_KEY) {
  throw new Error('Missing GOOGLE_API_KEY in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

const getSeverityPrompt = (line: string, userText?: string) => {
  const lower = line.toLowerCase();
  let prompt: string = "You are a log analysis assistant for technical support. Your responses must be: \n"
    // + "- Concise (2-5 sentences maximum) but if require the explanation then just give full answer there i\n
    + "- Technically accurate\n"
    + "- Action-oriented\n"
    + "- Written in plain English (avoid technical jargon)\n"
    + "- Structured with clear headings\n\n"
    + "Analyze this log line and ";

  const baseInstructions = "If uncertain, say 'I need more context to analyze this properly.'\n"
    + "Format response with bold headings using markdown:\n"
    + "**Analysis** | **Immediate Action** | **Prevention Steps**\n\n";

  if (lower.includes("error")) {
    prompt += `diagnose this ERROR log: "${line}"\n\n`
      + "1. Identify the most likely specific component/system causing this\n"
      + "2. Provide exact fix steps (max 3 steps)\n"
      + "3. List prevention measures (max 2 items)";
  } else if (lower.includes("info")) {
    prompt += `explain this INFO log: "${line}"\n\n`
      + "1. Context: Why this occurs in 1 sentence\n"
      + "2. System improvement suggestion (1 item)\n"
      + "3. Example scenario where this matters";
  } else {
    prompt += `interpret this log: "${line}"\n\n`
      + "1. Brief meaning explanation\n"
      + "2. Action required? (Yes/No with reason)\n"
      + "3. When to seek more help";
  }

  if (userText) {
    prompt += `\n\nUser Priority: Address this specific concern - "${userText}"\n`
      + "Response must directly answer this first";
  }

  prompt += `\n\n${baseInstructions}`
    + "Keep bullet points to 3 items maximum per section.\n"
    + "Total response length must not exceed 150 words.\n"
    + "Never suggest undocumented solutions.";

  return prompt;
};

router.post('/chat', async (req: Request, res: Response): Promise<void> => {
  const { logId, userText } = req.body;
  if (!logId) {
    res.status(400).json({ error: "logId is required." });
    return;
  }

  try {
    const rowLog = await UnifiedLogModel.findById({ _id: logId });

    if (!rowLog) {
      res.status(404).json({ error: "Log not found." });
      return;
    }

    const prompt = getSeverityPrompt(rowLog.rawLine || "", userText);
    const response = await model.generateContent(prompt);
    const generatedText = response.response.text();

    rowLog.analyzed = true;
    await rowLog.save();

    res.json({ response: generatedText });
  } catch (error) {
    console.error("Error while processing log:", error);
    res.status(500).json({ error: "Something went wrong while analyzing the log." });
  }
});

export default router;
