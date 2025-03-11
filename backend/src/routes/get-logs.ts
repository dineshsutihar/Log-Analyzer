import express from 'express';
import { Log } from '../models/Log';
const app = express.Router();

app.get('/logs', async (req, res) => {
  const logs = await Log.find().limit(100);
  res.json(logs);
});

export default app;