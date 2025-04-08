import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import uploadRoutes from './routes/upload';
import allLogs from './routes/getAllLogs';
import getStats from './routes/getStats';
import logtypeStatus from './routes/logTypeStatus';
import connectToDatabase from './db/connect';
import severityInfo from './routes/severityInfo';
import getLogAnalytics from './routes/getLogAnalytics';
import chatRouter from './routes/chat';

dotenv.config();

const app = express();
const PORT: number = parseInt(process.env.PORT || '3000', 10);

app.use(cors());

connectToDatabase();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req: Request, res: Response): void => {
  res.send('Log Analyzer Backend is running!');
});

app.use('/api', uploadRoutes);
app.use('/api', allLogs);
app.use('/api', getStats)
app.use('/api', logtypeStatus)
app.use('/api', severityInfo)
app.use('/api', getLogAnalytics)
app.use('/api', chatRouter)

app.listen(PORT, (): void => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
