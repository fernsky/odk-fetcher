export enum JobStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface JobProgress {
  total: number;
  processed: number;
  failed: number;
  percentage: number;
}

export interface Job {
  id: string;
  type: string;
  status: JobStatus;
  progress: JobProgress;
  startedAt: Date;
  completedAt?: Date;
  failedAt?: Date;
  error?: string;
  createdBy?: string;
}

export interface JobRepository {
  createJob(type: string, createdBy?: string): Promise<Job>;
  getActiveJob(type: string): Promise<Job | null>;
  updateJobStatus(jobId: string, status: JobStatus): Promise<Job>;
  updateJobProgress(
    jobId: string,
    progress: Partial<JobProgress>,
  ): Promise<Job>;
  completeJob(jobId: string): Promise<Job>;
  failJob(jobId: string, error: string): Promise<Job>;
}
