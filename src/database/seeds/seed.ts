import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../modules/drizzle/schema';
import { areaSeeds } from './data/areas';
import { wardSeeds } from './data/wards';
import { config } from 'dotenv';
import { sql } from 'drizzle-orm';

config();

async function seed() {
  console.log('🌱 Starting database seeding...');

  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client, { schema });

  try {
    console.log('Seeding wards...');

    // Insert wards with proper geometry conversion
    for (const ward of wardSeeds) {
      const geoJson = JSON.stringify(ward.geometry);
      await db.insert(schema.wards).values({
        ...ward,
        geometry: sql`ST_GeomFromGeoJSON(${geoJson})`,
      } as any);
    }

    console.log('Seeding areas...');

    // Insert areas with proper geometry conversion
    for (const area of areaSeeds) {
      const geoJson = JSON.stringify(area.geometry);
      await db.insert(schema.areas).values({
        ...area,
        geometry: sql`ST_GeomFromGeoJSON(${geoJson})`,
      } as any);
    }

    console.log('✅ Seeding completed successfully');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
