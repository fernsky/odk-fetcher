import {
  pgTable,
  varchar,
  timestamp,
  integer,
  index,
  pgEnum,
  text,
} from 'drizzle-orm/pg-core';
import { geometry } from './types/geographical';

export const rolesEnum = pgEnum('roles', [
  'enumerator',
  'supervisor',
  'admin',
  'superadmin',
]);

export const users = pgTable('users', {
  id: varchar('id', { length: 21 }).primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
  email: varchar('email', { length: 256 }).unique().notNull(),
  password: varchar('password', { length: 256 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  role: rolesEnum('role').default('enumerator'),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$defaultFn(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const wards = pgTable(
  'wards',
  {
    wardNumber: integer('ward_number').primaryKey(),
    wardAreaCode: integer('ward_area_code').notNull(),
    geometry: geometry('geometry', { type: 'Polygon' }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$defaultFn(() => new Date()),
    deletedAt: timestamp('deleted_at'),
    syncStatus: text('sync_status').default('pending'),
  },
  (t) => ({
    wardNumberIdx: index('ward_number_idx').on(t.wardNumber),
  }),
);

export type Ward = typeof wards.$inferSelect;
export type NewWard = typeof wards.$inferInsert;

/*
The area status works in the following way:
1. unassigned: The area is not assigned to any enumerator
2. newly_assigned: The area is newly assigned to an enumerator. 
                   This occurs when an area request is approved.
3. ongoing_survey: The enumerator is currently surveying the area.
                   This occurrs if there is any survey data for the area by
                   the approved enumerator.
4. revision:       The enumerator has said he has completed the survey but the
                    supervisor has requested for a revision in that area.
5. asked_for_completion: The enumerator has completed the survey and asked for completion 
                   from the supervisor
6. asked_for_revision_completion: The enumerator has completed the revision and asked for completion.
7. asked_for_withdrawl: The enumerator has asked for withdrawl from surveying the area.
*/

export const areaStatusEnum = pgEnum('area_status_enum', [
  'unassigned',
  'newly_assigned',
  'ongoing_survey',
  'revision',
  'asked_for_completion',
  'asked_for_revision_completion',
  'asked_for_withdrawl',
]);

export type AreaStatus =
  | 'unassigned'
  | 'newly_assigned'
  | 'ongoing_survey'
  | 'revision'
  | 'asked_for_completion'
  | 'asked_for_revision_completion'
  | 'asked_for_withdrawl';

export const areas = pgTable('areas', {
  id: varchar('id', { length: 36 }).primaryKey(),
  code: integer('code').notNull(),
  wardNumber: integer('ward')
    .notNull()
    .references(() => wards.wardNumber),
  geometry: geometry('geometry', { type: 'Polygon' }),
  assignedTo: varchar('assigned_to', { length: 21 }).references(() => users.id),
  areaStatus: areaStatusEnum('area_status').default('unassigned'),
});

export type Area = typeof areas.$inferSelect;
export type NewArea = typeof areas.$inferInsert;
