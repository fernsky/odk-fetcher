import {
  pgTable,
  varchar,
  integer,
  timestamp,
  decimal,
  text,
  jsonb,
} from 'drizzle-orm/pg-core';

// Define types for the nested structures to ensure type safety
export type HouseholdData = {
  household_survey_date: string;
  household_submission_date: string;
  household_gps_latitude: number;
  household_gps_longitude: number;
  household_gps_altitude: number;
  household_gps_accuracy: number;
  household_locality: string;
  household_development_organization: string;
  household_image_key?: string;
  household_enumerator_selfie_key?: string;
  household_audio_recording_key?: string;
};

export type BusinessData = {
  business_survey_date: string;
  business_submission_date: string;
  business_gps_latitude: number;
  business_gps_longitude: number;
  business_gps_altitude: number;
  business_gps_accuracy: number;
  business_locality: string;
  business_image_key?: string;
  business_enumerator_selfie_key?: string;
  business_audio_recording_key?: string;
};

//  Aggregated building data
export const buddhashantiAggregateBuilding = pgTable(
  'buddhashanti_aggregate_buildings',
  {
    // Primary identifier
    id: varchar('id', { length: 48 }).primaryKey(),
    buildingId: varchar('building_id', { length: 48 }),

    // Dates and enumerator info
    buildingSurveyDate: timestamp('building_survey_date'),
    buildingSubmissionDate: timestamp('building_submission_date'),
    enumeratorId: varchar('enumerator_id', { length: 255 }),
    enumeratorName: varchar('enumerator_name', { length: 255 }),
    enumeratorPhone: varchar('enumerator_phone', { length: 50 }),

    // Location info
    wardNumber: integer('ward_number'),
    areaCode: integer('area_code'),
    locality: varchar('locality', { length: 255 }),

    // Building details
    buildingToken: varchar('building_token', { length: 255 }),
    buildingOwnerName: varchar('building_owner_name', { length: 255 }),
    buildingOwnerPhone: varchar('building_owner_phone', { length: 50 }),

    // Counts
    totalFamilies: integer('total_families'),
    totalBusinesses: integer('total_businesses'),

    // GPS coordinates
    buildingGpsLatitude: decimal('building_gps_latitude', {
      precision: 10,
      scale: 6,
    }),
    buildingGpsLongitude: decimal('building_gps_longitude', {
      precision: 10,
      scale: 6,
    }),
    buildingGpsAltitude: decimal('building_gps_altitude', {
      precision: 10,
      scale: 2,
    }),
    buildingGpsAccuracy: decimal('building_gps_accuracy', {
      precision: 10,
      scale: 2,
    }),

    // Building characteristics
    buildingOwnershipStatus: varchar('building_ownership_status', {
      length: 100,
    }),
    buildingOwnershipStatusOther: text('building_ownership_status_other'),
    buildingBase: varchar('building_base', { length: 100 }),
    buildingBaseOther: text('building_base_other'),
    buildingOuterWall: varchar('building_outer_wall', { length: 100 }),
    buildingOuterWallOther: text('building_outer_wall_other'),
    buildingRoof: varchar('building_roof', { length: 100 }),
    buildingRoofOther: text('building_roof_other'),
    naturalDisasters: text('natural_disasters').array(),
    naturalDisastersOther: text('natural_disasters_other'),

    // Media keys
    buildingImageKey: varchar('building_image_key', { length: 255 }),
    buildingEnumeratorSelfieKey: varchar('building_enumerator_selfie_key', {
      length: 255,
    }),
    buildingAudioRecordingKey: varchar('building_audio_recording_key', {
      length: 255,
    }),

    // JSONB fields for nested data
    households: jsonb('households').$type<HouseholdData[]>(),
    businesses: jsonb('businesses').$type<BusinessData[]>(),

    // Metadata
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').$onUpdate(() => new Date()),
  },
);

export type BuddhashantiAggregateBuilding =
  typeof buddhashantiAggregateBuilding.$inferSelect;

export type NewBuddhashantiAggregateBuilding =
  typeof buddhashantiAggregateBuilding.$inferInsert;
