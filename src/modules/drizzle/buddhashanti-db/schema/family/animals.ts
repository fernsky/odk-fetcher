import { pgTable, varchar, integer, decimal } from 'drizzle-orm/pg-core';
import { family } from './family';

export const stagingbuddhashantiAnimal = pgTable('staging_buddhashanti_animal', {
  id: varchar('id', { length: 48 }).primaryKey().notNull(),
  familyId: varchar('family_id', { length: 48 }),
  wardNo: integer('ward_no').notNull(),
  animalName: varchar('animal_name', { length: 100 }),
  animalNameOther: varchar('animal_name_other', { length: 100 }),
  totalAnimals: integer('total_animals'),
  animalSales: decimal('animal_sales', { precision: 10, scale: 2 }),
  animalRevenue: decimal('animal_revenue', { precision: 10, scale: 2 }),
});

export const buddhashantiAnimal = pgTable('buddhashanti_animal', {
  id: varchar('id', { length: 48 }).primaryKey().notNull(),
  familyId: varchar('family_id', { length: 48 }).references(() => family.id),
  wardNo: integer('ward_no').notNull(),
  animalName: varchar('animal_name', { length: 100 }),
  animalNameOther: varchar('animal_name_other', { length: 100 }),
  totalAnimals: integer('total_animals'),
  animalSales: decimal('animal_sales', { precision: 10, scale: 2 }),
  animalRevenue: decimal('animal_revenue', { precision: 10, scale: 2 }),
});

export type buddhashantiAnimal = typeof buddhashantiAnimal.$inferSelect;
export type StagingbuddhashantiAnimal = typeof stagingbuddhashantiAnimal.$inferSelect;
