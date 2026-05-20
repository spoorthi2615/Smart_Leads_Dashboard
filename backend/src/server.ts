import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/authRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { connectDB } from './config/db.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import { env, logEnvConfig } from './config/env.js';
import { swaggerSpec } from './config/swagger.js';
import {
  applyHelmet,
  applyMongoSanitize,
  secureCorsOptions,
  authLoginLimiter,
  authRegisterLimiter,
} from './config/security.js';

logEnvConfig();

console.log('[Backend] Starting Smart Lead API');
console.log(`[Backend] Environment: ${env.NODE_ENV}`);
console.log(`[Backend] PORT: ${env.PORT}`);
console.log(`[Backend] API base URL: http://localhost:${env.PORT}/api`);
console.log(`[Backend] Health check: http://localhost:${env.PORT}/api/health`);

const app = express();
app.disable('x-powered-by');

// Security middleware
applyHelmet(app);
app.use(cors(secureCorsOptions()));
app.use(express.json());
applyMongoSanitize(app);

app.get('/', (_req, res) => {
  res.json({ message: 'API Running smoothly!' });
});

app.get('/api/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'Smart Lead API is healthy' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rate-limited auth routes for brute-force prevention
app.use('/api/auth/register', authRegisterLimiter);
app.use('/api/auth/login', authLoginLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use(errorMiddleware);

async function startServer(): Promise<void> {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
  });
}

startServer().catch((error: unknown) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
