import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { connectDB } from './config/db.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';

const envPath = fileURLToPath(new URL('../.env', import.meta.url));
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.warn('[Backend] dotenv failed to load .env file:', envPath, result.error);
} else {
  console.log('[Backend] dotenv loaded .env file:', envPath);
}

const port = Number(process.env.PORT ?? 5000);
const env = process.env.NODE_ENV ?? 'development';

console.log('[Backend] Starting Smart Lead API');
console.log(`[Backend] Environment: ${env}`);
console.log(`[Backend] PORT: ${port}`);
console.log(`[Backend] API base URL: http://localhost:${port}/api`);
console.log(`[Backend] Health check: http://localhost:${port}/api/health`);

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ message: 'API Running smoothly!' });
});

app.get('/api/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'Smart Lead API is healthy' });
});

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use(errorMiddleware);

async function startServer(): Promise<void> {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

startServer().catch((error: unknown) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
