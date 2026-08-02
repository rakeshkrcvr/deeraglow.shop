import { neon } from '@neondatabase/serverless';

function getSqlInstance() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    if (typeof window !== 'undefined') {
      return ((..._args: unknown[]) => Promise.resolve([])) as unknown as ReturnType<typeof neon>;
    }
    console.warn('DATABASE_URL is not set in the environment variables');
    return ((..._args: unknown[]) => Promise.resolve([])) as unknown as ReturnType<typeof neon>;
  }
  return neon(dbUrl);
}

export const sql = getSqlInstance();
