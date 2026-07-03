import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in the environment variables');
}

// Create a serverless SQL query client
export const sql = neon(process.env.DATABASE_URL);
