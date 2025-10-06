import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ZodError } from 'zod';
import { connectToDatabase } from './services/mongo';
import quizRoutes from './routes/quiz';
import topupRoutes from './routes/topup';
import leaderboardRoutes from './routes/leaderboard';
import adminRoutes from './routes/admin';
import userAuthRoutes from './routes/user-auth';
import adminAuthRoutes from './routes/admin-auth';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'development' });
});

app.use('/api/quiz', quizRoutes);
app.use('/api/topup', topupRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', userAuthRoutes);
app.use('/api/admin/auth', adminAuthRoutes);

// Centralized Zod error handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'ValidationError', details: err.flatten() });
  }
  return res.status(500).json({ error: 'InternalServerError' });
});

const port = Number(process.env.PORT || 4000);

async function start() {
  await connectToDatabase();
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`server is running on http://localhost:${port}`);
  });
}

start().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server', error);
  process.exit(1);
});


