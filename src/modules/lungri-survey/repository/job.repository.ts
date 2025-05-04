import { Injectable } from '@nestjs/common';
import {
  Job,
  JobRepository,
  JobStatus,
  JobProgress,
} from '../interfaces/job.interface';
import { v4 as uuidv4 } from 'uuid';
import { jobModel } from '../model/job.model';
import { lungriDb } from '../../../modules/drizzle/lungri-db';
import { eq, and, desc } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

@Injectable()
export class JobRepositoryImpl implements JobRepository {
  async createJob(type: string): Promise<Job> {
    const jobId = uuidv4();

    const progress: JobProgress = {
      total: 0,
      processed: 0,
      failed: 0,
      percentage: 0,
    };

    const [job] = await lungriDb
      .insert(jobModel)
      .values({
        id: jobId,
        type: type,
        status: JobStatus.PENDING,
        progress: progress,
        startedAt: new Date(),
      })
      .returning();

    return job;
  }

  async getActiveJob(type: string): Promise<Job | null> {
    const jobs = await lungriDb
      .select()
      .from(jobModel)
      .where(
        and(
          eq(jobModel.type, type),
          sql`${jobModel.status} IN (${JobStatus.PENDING}, ${JobStatus.RUNNING})`,
        ),
      )
      .orderBy(desc(jobModel.startedAt))
      .limit(1);

    return jobs.length > 0 ? jobs[0] : null;
  }

  async updateJobStatus(jobId: string, status: JobStatus): Promise<Job> {
    const [updatedJob] = await lungriDb
      .update(jobModel)
      .set({
        status: status,
      })
      .where(eq(jobModel.id, jobId))
      .returning();

    return updatedJob;
  }

  async updateJobProgress(
    jobId: string,
    progress: Partial<JobProgress>,
  ): Promise<Job> {
    // First retrieve current job
    const jobs = await lungriDb
      .select()
      .from(jobModel)
      .where(eq(jobModel.id, jobId))
      .limit(1);

    if (jobs.length === 0) {
      throw new Error(`Job with id ${jobId} not found`);
    }

    const currentJob = jobs[0];
    const currentProgress = currentJob.progress;

    const updatedProgress = {
      ...currentProgress,
      ...progress,
    };

    // Calculate percentage if total is available
    if (updatedProgress.total > 0) {
      updatedProgress.percentage = Math.round(
        (updatedProgress.processed / updatedProgress.total) * 100,
      );
    }

    const [updatedJob] = await lungriDb
      .update(jobModel)
      .set({
        progress: updatedProgress,
      })
      .where(eq(jobModel.id, jobId))
      .returning();

    return updatedJob;
  }

  async completeJob(jobId: string): Promise<Job> {
    const [completedJob] = await lungriDb
      .update(jobModel)
      .set({
        status: JobStatus.COMPLETED,
      })
      .where(eq(jobModel.id, jobId))
      .returning();

    return completedJob;
  }

  async failJob(jobId: string): Promise<Job> {
    const [failedJob] = await lungriDb
      .update(jobModel)
      .set({
        status: JobStatus.FAILED,
      })
      .where(eq(jobModel.id, jobId))
      .returning();

    return failedJob;
  }
}
