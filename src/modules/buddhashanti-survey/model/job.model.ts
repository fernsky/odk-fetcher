import { pgTable, varchar, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { JobProgress, JobStatus } from '../interfaces/job.interface';

export const jobModel = pgTable('jobs', {
  id: varchar('id', { length: 48 }).primaryKey().notNull(),
  type: varchar('type', { length: 100 }).notNull(),
  status: varchar('status', { length: 20 }).$type<JobStatus>().notNull(),
  progress: jsonb('progress').$type<JobProgress>().notNull(),
  startedAt: timestamp('started_at').notNull(),
  completedAt: timestamp('completed_at'),
  failedAt: timestamp('failed_at'),
  error: varchar('error', { length: 1000 }),
  createdBy: varchar('created_by', { length: 48 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').$onUpdate(() => new Date()),
});
