import { pgTable, varchar, integer, decimal } from "drizzle-orm/pg-core";
import { family } from "./family";

export const staginglungriAnimalProduct = pgTable(
  "staging_lungri_animal_product",
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

export const lungriAnimalProduct = pgTable(
  "lungri_animal_product",
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

export type lungriAnimalProduct =
  typeof lungriAnimalProduct.$inferSelect;
export type StaginglungriAnimalProduct =
  typeof staginglungriAnimalProduct.$inferSelect;
