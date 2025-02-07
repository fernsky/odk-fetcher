import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import { env } from 'process';
dotenv.config();

export default defineConfig({
  schema: './src/modules/drizzle/kerabari-db/schema/**/*.ts',
  out: './kerabari-migration',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.KERABARI_DATABASE_URL!,
  },
  extensionsFilters: ['postgis'],
  tablesFilter: [`acme_*`],
});
