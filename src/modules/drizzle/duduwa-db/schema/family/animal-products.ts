import { pgTable, varchar, integer, decimal } from "drizzle-orm/pg-core";
import { family } from "./family";

export const stagingduduwaAnimalProduct = pgTable(
  "staging_duduwa_animal_product",
  {
    id: varchar("id", { length: 48 }).primaryKey().notNull(),
    familyId: varchar("family_id", { length: 48 }),
    wardNo: integer("ward_no").notNull(),
    animalProductName: varchar("animal_product_name", { length: 100 }),
    animalProductNameOther: varchar("animal_product_name_other", {
      length: 100,
    }),
    animalProductUnit: varchar("animal_product_unit", { length: 100 }),
    animalProductUnitOther: varchar("animal_product_unit_other", {
      length: 100,
    }),
    animalProductSales: decimal("animal_product_sales", {
      precision: 10,
      scale: 2,
    }),
    animalProductProduction: decimal("animal_product_production", {
      precision: 10,
      scale: 2,
    }),
    animalProductProductionMonths: integer("animal_product_production_months"),
    animalProductRevenue: decimal("animal_product_revenue", {
      precision: 10,
      scale: 2,
    }),
  },
);

export const duduwaAnimalProduct = pgTable(
  "duduwa_animal_product",
  {
    id: varchar("id", { length: 48 }).primaryKey().notNull(),
    familyId: varchar("family_id", { length: 48 }).references(() => family.id),
    wardNo: integer("ward_no").notNull(),
    animalProductName: varchar("animal_product_name", { length: 100 }),
    animalProductNameOther: varchar("animal_product_name_other", {
      length: 100,
    }),
    animalProductUnit: varchar("animal_product_unit", { length: 100 }),
    animalProductUnitOther: varchar("animal_product_unit_other", {
      length: 100,
    }),
    animalProductSales: decimal("animal_product_sales", {
      precision: 10,
      scale: 2,
    }),
    animalProductProduction: decimal("animal_product_production", {
      precision: 10,
      scale: 2,
    }),
    animalProductProductionMonths: integer("animal_product_production_months"),
    animalProductRevenue: decimal("animal_product_revenue", {
      precision: 10,
      scale: 2,
    }),
  },
);

export type duduwaAnimalProduct =
  typeof duduwaAnimalProduct.$inferSelect;
export type StagingduduwaAnimalProduct =
  typeof stagingduduwaAnimalProduct.$inferSelect;
