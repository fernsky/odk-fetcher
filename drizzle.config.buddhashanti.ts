import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import { env } from 'process';
dotenv.config();

export default defineConfig({
  schema: './src/modules/drizzle/buddhashanti-db/schema/**/*.ts',
  out: './buddhashanti-migration',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.BUDDHASHANTI_DATABASE_URL!,
  },
  extensionsFilters: ['postgis'],
  tablesFilter: [`acme_*`],
});
