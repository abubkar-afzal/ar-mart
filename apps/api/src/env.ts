import { config as loadDotenv } from 'dotenv';
import { resolve } from 'node:path';

// Load the monorepo-root .env first (works when run from apps/api),
// then fall back to a local .env in the api package if present.
// The root .env wins because it is loaded first and dotenv does not
// overwrite already-set variables.
loadDotenv({ path: resolve(process.cwd(), '../../.env') });
loadDotenv({ path: resolve(process.cwd(), '.env') });

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  mongoUri: required('MONGODB_URI', 'mongodb://127.0.0.1:27017/armart'),
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  cookieSecure: (process.env.COOKIE_SECURE ?? 'false') === 'true',
  isProd: (process.env.NODE_ENV ?? 'development') === 'production',
};