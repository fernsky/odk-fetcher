import { pgTable, varchar, integer, decimal } from 'drizzle-orm/pg-core';
import { family } from './family';

const lungriAgriculturalLand = pgTable('lungri_agricultural_land', {
  id: varchar('id', { length: 48 }).primaryKey().notNull(),
  familyId: varchar('family_id', { length: 48 }).references(() => family.id),
  wardNo: integer('ward_no'),
  landOwnershipType: varchar('land_ownership_type', { length: 100 }),
  landArea: decimal('land_area', { precision: 10, scale: 2 }),
  isLandIrrigated: varchar('is_land_irrigated', { length: 100 }),
  irrigatedLandArea: decimal('irrigated_land_area', {
    precision: 10,
    scale: 2,
  }),
  irrigationSource: varchar('irrigation_source', { length: 100 }),
});

export default lungriAgriculturalLand;
export const staginglungriAgriculturalLand = pgTable(
  'staging_lungri_agricultural_land',
  {
    id: varchar('id', { length: 48 }).primaryKey().notNull(),
    familyId: varchar('family_id', { length: 48 }),
    wardNo: integer('ward_no'),
    landOwnershipType: varchar('land_ownership_type', { length: 100 }),
    landArea: decimal('land_area', { precision: 10, scale: 2 }),
    isLandIrrigated: varchar('is_land_irrigated', { length: 100 }),
    irrigatedLandArea: decimal('irrigated_land_area', {
      precision: 10,
      scale: 2,
    }),
    irrigationSource: varchar('irrigation_source', { length: 100 }),
  },
);

export type lungriAgriculturalLand = typeof lungriAgriculturalLand.$inferSelect;
export type StaginglungriAgriculturalLand =
  typeof staginglungriAgriculturalLand.$inferSelect;
