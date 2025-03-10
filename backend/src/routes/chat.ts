import express from 'express';
import { Request, Response } from 'express';
import { LinuxLogModel } from '../models/LinuxLogModel';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
router.use(express.json());

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
  prompt += `\n\nPlease provide a detailed analysis of the log and give answer in step wise. and your answer should not exceed more than 400 words.`;

  return prompt;
};

router.post('/chat', async (req: Request, res: Response): Promise<void> => {
  console.log("Received request body:", req.body);
  const { logId, userText } = req.body;
  console.log("Received logId:", logId);
  console.log("Received userText:", userText);

  if (!logId) {
    console.log("logId is missing in the request body.");
    res.status(400).json({ error: "logId is required." });
  }

  try {
    const rowLog = await LinuxLogModel.findById(logId);

    if (!rowLog) {
      res.status(404).json({ error: "Log not found." });
      return;
    }

    const prompt = getSeverityPrompt(rowLog.rawLine, userText);
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
