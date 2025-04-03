import express from 'express';
import UnifiedLogModel from '../models/UnifiedLogModel';
const app = express.Router();

app.get('/winlogs', async (req, res) => {
  const logs = await UnifiedLogModel.find({ source: 'WINDOWS' }).limit(100);
  res.json(logs);
});

app.get('/linlogs', async (req, res) => {
  const logs = await UnifiedLogModel.find({ source: 'LINUX' }).limit(100);
  res.json(logs);
});

app.get('/kernellogs', async (req, res) => {
  const logs = await UnifiedLogModel.find({ source: 'LINUX', logType: 'KERNEL' }).limit(100);
  res.json(logs);
});

app.get('/syslogs', async (req, res) => {
  const logs = await UnifiedLogModel.find({ source: 'LINUX', logType: 'SYSLOG' }).limit(100);
  res.json(logs);
});

app.get('/authlogs', async (req, res) => {
  const logs = await UnifiedLogModel.find({ source: 'LINUX', logType: 'AUTH' }).limit(100);
  res.json(logs);
});

app.get('/unknownlogs', async (req, res) => {
  const logs = await UnifiedLogModel.find({ source: 'LINUX', logType: { $regex: 'UNKNOWN' } }).limit(100);
  res.json(logs);
});

export default app;
