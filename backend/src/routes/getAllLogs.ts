import express from 'express';
import { WindowsLogModel } from '../models/LogWindowModel';
const app = express.Router();

app.get('/logs', async (req, res) => {
  const logs = await WindowsLogModel.find().limit(100);
  res.json(logs);
});

export default app;