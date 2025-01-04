import { Router, Request, Response } from 'express';
import fs from 'fs';
import readline from 'readline';
import multer from 'multer';
import { parseSyslogLine } from '../utils/logParser';

import {Log} from '../models/Log';

const router = Router();

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('logfile'), (req: Request, res: Response): void => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  const filePath = req.file.path;
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({ input: fileStream });

  const parsedLogs: any[] = [];

  rl.on('line', async(line: string) => {
    try {
      const parsedLog = parseSyslogLine(line);
      const logEntry = new Log(parsedLog);
      await logEntry.save();
    parsedLogs.push(parsedLog);
    } catch (error) {
      console.error(`Failed to parse line: ${line}`);
    }
  });

  rl.on('close', () => {
    fs.unlinkSync(filePath); // Delete the file after processing
    res.json(parsedLogs);
  });
});

export default router;
