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
  let prompt: string;

  if (lower.includes("error")) {
    prompt = `This is an error log: "${line}". What caused this and how can we fix it? Provide a step-by-step fix if possible.`;
  } else if (lower.includes("info")) {
    prompt = `This is an informational log: "${line}". Why did this happen, and how can we improve our system to avoid this in future?`;
  } else {
    prompt = `Here is a log line: "${line}". Can you explain what it might mean and whether any action is required?`;
  }

  if (userText) {
    prompt += `\nUser's additional question: "${userText}"`;
  }
  prompt += `\n\nPlease provide a detailed analysis of the log and fix if required and give answer in step wise. and answer should be in a simple language which can be easy to understand and also don't give too long response give accurate and point to point.`;

  return prompt;
};

router.post('/chat', async (req: Request, res: Response): Promise<void> => {
  const { logId, userText } = req.body;

  if (!logId) {
    res.status(400).json({ error: "logId is required." });
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
