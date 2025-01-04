import { Router, Request, Response } from 'express';
import { parseSyslogLine } from '../utils/logParser';

const router = Router();

router.post('/parse', (req: Request, res: Response): void => {
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

export default router;
