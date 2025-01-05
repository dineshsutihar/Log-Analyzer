import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import uploadRoutes from './routes/upload';
import parseRoutes from './routes/parse';
import allLogs from './routes/get-logs';
import { connectToDatabase } from './db/connect';

dotenv.config();

const app = express();
const PORT: number = parseInt(process.env.PORT || '3000', 10);

connectToDatabase();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req: Request, res: Response): void => {
  res.send('Log Analyzer Backend is running!');
});

app.use('/api', parseRoutes);
app.use('/api', uploadRoutes);
app.use('/api', allLogs);

app.listen(PORT, (): void => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
