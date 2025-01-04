import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import uploadRoutes from './routes/upload';
import parseRoutes from './routes/parse';

dotenv.config();

const app = express();
const PORT: number = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req: Request, res: Response): void => {
  res.send('Log Analyzer Backend is running!');
});

app.use('/api', parseRoutes);
app.use('/api', uploadRoutes);

app.listen(PORT, (): void => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
