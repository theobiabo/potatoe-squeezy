import { config } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'drizzle-kit';

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

config({ path: resolve(workspaceRoot, '.env') });
config({ path: resolve(workspaceRoot, '.env.local') });

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
