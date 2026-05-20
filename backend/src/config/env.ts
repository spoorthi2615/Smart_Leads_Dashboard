/**
 * Environment variable validation and configuration
 * Ensures all required environment variables are present at startup
 * and provides strict typing for environment configuration
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const envPath = fileURLToPath(new URL('../../.env', import.meta.url));
const dotenvResult = dotenv.config({ path: envPath });

if (dotenvResult.error && process.env.NODE_ENV !== 'production') {
  console.warn('[Environment] .env file not loaded:', envPath);
}

interface EnvConfig {
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  MONGO_URI: string;
  JWT_SECRET: string;
  FRONTEND_ORIGIN: string;
}

/**
 * Validates and parses environment variables
 * Throws an error immediately if required variables are missing
 * Provides default values where appropriate
 */
function validateEnv(): EnvConfig {
  const errors: string[] = [];

  // Validate required variables
  if (!process.env.MONGO_URI) {
    errors.push('MONGO_URI is required');
  }

  if (!process.env.JWT_SECRET) {
    errors.push('JWT_SECRET is required');
  }

  if (!process.env.FRONTEND_ORIGIN && process.env.NODE_ENV === 'production') {
    errors.push('FRONTEND_ORIGIN is required in production');
  }

  if (errors.length > 0) {
    console.error('[Environment] Configuration errors:');
    errors.forEach((err) => console.error(`  - ${err}`));
    process.exit(1);
  }

  const port = Number(process.env.PORT ?? 5000);
  const rawNodeEnv = process.env.NODE_ENV ?? 'development';
  const mongoUri = process.env.MONGO_URI as string;
  const jwtSecret = process.env.JWT_SECRET as string;
  const frontendOrigin = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173';

  if (isNaN(port) || port < 1 || port > 65535) {
    console.error('[Environment] PORT must be a valid port number (1-65535)');
    process.exit(1);
  }

  if (!['development', 'production', 'test'].includes(rawNodeEnv)) {
    console.error('[Environment] NODE_ENV must be development, production, or test');
    process.exit(1);
  }

  return {
    PORT: port,
    NODE_ENV: rawNodeEnv as EnvConfig['NODE_ENV'],
    MONGO_URI: mongoUri,
    JWT_SECRET: jwtSecret,
    FRONTEND_ORIGIN: frontendOrigin,
  };
}

export const env = validateEnv();

/**
 * Logs environment configuration (safely, without exposing secrets)
 */
export function logEnvConfig(): void {
  console.log('[Environment] Configuration validated:');
  console.log(`  - NODE_ENV: ${env.NODE_ENV}`);
  console.log(`  - PORT: ${env.PORT}`);
  console.log(`  - FRONTEND_ORIGIN: ${env.FRONTEND_ORIGIN}`);
  console.log(`  - MONGO_URI: ${env.MONGO_URI.replace(/:[^:/@]+@/, ':***@').substring(0, 60)}...`);
}
