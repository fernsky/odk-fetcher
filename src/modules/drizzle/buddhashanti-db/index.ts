import { drizzle } from 'drizzle-orm/postgres-js';
import * as postgres from 'postgres';
import * as schema from './schema';
import { config } from 'dotenv';
import { env } from 'process';

config(); // Initialize dotenv

let connection;
try {
  console.log('Attempting to connect to:', env.BUDDHASHANTI_DATABASE_URL);
  connection = postgres(env.BUDDHASHANTI_DATABASE_URL, {
    max_lifetime: 10,
    connect_timeout: 10,
  });
} catch (error) {
  console.error('Database connection error:', error);
  throw new Error(`Failed to connect to the database: ${error}`);
}

export const buddhashantiDb = drizzle(connection, { schema });
