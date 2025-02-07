import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import { env } from 'process';
dotenv.config();

export default defineConfig({
  schema: './src/modules/drizzle/schema.ts',
  out: './migration',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL!,
  },
  extensionsFilters: ['postgis'],
});
