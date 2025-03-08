import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import { env } from 'process';
dotenv.config();

export default defineConfig({
  schema: './src/modules/drizzle/gadhawa-db/schema/**/*.ts',
  out: './gadhawa-migration',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.GADHAWA_DATABASE_URL!,
  },
  extensionsFilters: ['postgis'],
  tablesFilter: [`acme_*`],
});
