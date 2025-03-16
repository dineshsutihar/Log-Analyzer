import express from 'express';
import { WindowsLogModel } from '../models/LogWindowModel';
import { LinuxLogModel } from '../models/LinuxLogModel';
const app = express.Router();

app.get('/winlogs', async (req, res) => {
  const logs = await WindowsLogModel.find().limit(100);
  res.json(logs);
});
app.get('/linlogs', async (req, res) => {
  const logs = await LinuxLogModel.find().limit(100);
  res.json(logs);
});

app.get('/kernellogs', async (req, res) => {
  const logs = await LinuxLogModel.find({ logType: 'KERNEL' }).limit(100);
  res.json(logs);
});

app.get('/authlogs', async (req, res) => {
  const logs = await LinuxLogModel.find({ logType: 'AUTH' }).limit(100);
  res.json(logs);
});


export default app;