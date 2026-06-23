import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  FRONTEND_URL: z
    .string()
    .min(1, 'FRONTEND_URL is required')
    .default('http://localhost:3000'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

const PRODUCTION_FRONTEND_URL = 'https://ai-powered-trip-planner-frontend.vercel.app';

export const allowedOrigins = [
  ...new Set([
    ...env.FRONTEND_URL.split(',').map((origin) => origin.trim()).filter(Boolean),
    PRODUCTION_FRONTEND_URL,
  ]),
];
