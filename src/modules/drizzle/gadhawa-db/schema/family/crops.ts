import { pgTable, varchar, integer, decimal } from 'drizzle-orm/pg-core';
import { family } from './family';

export const staginggadhawaCrop = pgTable('staging_gadhawa_crop', {
  id: varchar('id', { length: 48 }).primaryKey().notNull(),
  familyId: varchar('family_id', { length: 48 }).notNull(),
  wardNo: integer('ward_no').notNull(),
  cropType: varchar('crop_type', { length: 100 }),
  cropName: varchar('crop_name', { length: 100 }),
  cropArea: decimal('crop_area', { precision: 10, scale: 2 }),
  cropCount: integer('crop_count'),
  cropProduction: decimal('crop_production', { precision: 10, scale: 2 }),
  cropSales: decimal('crop_sales', { precision: 10, scale: 2 }),
  cropRevenue: decimal('crop_revenue', { precision: 10, scale: 2 }),
});

export const gadhawaCrop = pgTable('gadhawa_crop', {
  id: varchar('id', { length: 48 }).primaryKey().notNull(),
  familyId: varchar('family_id', { length: 48 }).references(() => family.id),
  wardNo: integer('ward_no').notNull(),
  cropType: varchar('crop_type', { length: 100 }),
  cropName: varchar('crop_name', { length: 100 }),
  cropArea: decimal('crop_area', { precision: 10, scale: 2 }),
  cropCount: integer('crop_count'),
  cropProduction: decimal('crop_production', { precision: 10, scale: 2 }),
  cropSales: decimal('crop_sales', { precision: 10, scale: 2 }),
  cropRevenue: decimal('crop_revenue', { precision: 10, scale: 2 }),
});

export type gadhawaCrop = typeof gadhawaCrop.$inferSelect;
export type StaginggadhawaCrop = typeof staginggadhawaCrop.$inferSelect;
