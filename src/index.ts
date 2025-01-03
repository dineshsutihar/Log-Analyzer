import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { parseSyslogLine } from './utils/logParser';

dotenv.config();

const app = express();
const PORT: number = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

app.get('/', (req: Request, res: Response): void => {
  res.send('Log Analyzer Backend is running!');
});

app.post('/parse', (req: Request, res: Response): void => {
  const { logLine } = req.body as { logLine?: string };

  if (!logLine) {
    res.status(400).json({ error: 'logLine is required' });
    return;
  }

  try {
    const parsedLog = parseSyslogLine(logLine);
    res.json(parsedLog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to parse log line' });
  }
});

app.listen(PORT, (): void => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
