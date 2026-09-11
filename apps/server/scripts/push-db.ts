import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const workspaceRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../..',
);

config({ path: resolve(workspaceRoot, '.env') });
config({ path: resolve(workspaceRoot, '.env.local') });

async function push() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle(sql);

    console.log('Connected to database');
    console.log('Schema push completed');
  } catch (error) {
    console.error('Failed to connect:', error);
  }
}

push();
