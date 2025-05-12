import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { JobStatus } from '../interfaces/job.interface';
import { JobRepositoryImpl } from '../repository/job.repository';
import { BuildingSurveyRepositoryImpl } from '../repository/building.form.repository';
import { BuildingProcessorService } from './processors/building-processor.service';

@Injectable()
export class BuildingAggregateService {
  private readonly logger = new Logger(BuildingAggregateService.name);
  private readonly JOB_TYPE = 'BUILDING_AGGREGATION';
  private readonly BATCH_SIZE = 50;

  constructor(
    private jobRepository: JobRepositoryImpl,
    private buildingSurveyRepository: BuildingSurveyRepositoryImpl,
    private buildingProcessor: BuildingProcessorService,
  ) {}

  async startAggregation(userId?: string): Promise<any> {
    this.logger.log(
      `Starting new aggregation job requested by user: ${userId || 'system'}`,
    );

    // Check if there's an active job
    this.logger.debug('Checking for active aggregation jobs');
    const activeJob = await this.jobRepository.getActiveJob(this.JOB_TYPE);
    if (activeJob) {
      this.logger.warn(
        `Aggregation job ${activeJob.id} is already in progress`,
      );
      throw new ConflictException('An aggregation job is already in progress');
    }

    // Create a new job
    this.logger.log('Creating new aggregation job');
    const job = await this.jobRepository.createJob(this.JOB_TYPE);
    this.logger.log(`Created aggregation job with ID: ${job.id}`);

    // Start the aggregation process in the background
    this.processAggregation(job.id).catch((error) => {
      this.logger.error(
        `Aggregation job ${job.id} failed: ${error.message}`,
        error instanceof Error ? error.stack : undefined,
      );
      this.jobRepository.failJob(job.id);
    });

    return {
      jobId: job.id,
      status: job.status,
      message: 'Aggregation process started',
    };
  }

  async getAggregationStatus() {
    this.logger.debug('Fetching current aggregation job status');
    return this.jobRepository.getActiveJob(this.JOB_TYPE);
  }

  async stopAggregation(jobId: string): Promise<boolean> {
    this.logger.log(`Stopping aggregation job ${jobId} by user request`);
    const job = await this.jobRepository.failJob(jobId);
    this.logger.log(`Job ${jobId} status after stop request: ${job.status}`);
    return job.status === JobStatus.FAILED;
  }

  private async processAggregation(jobId: string): Promise<void> {
    try {
      this.logger.log(`Starting processing for aggregation job ${jobId}`);

      // Update job status to running
      await this.jobRepository.updateJobStatus(jobId, JobStatus.RUNNING);
      this.logger.log(`Updated job ${jobId} status to RUNNING`);

      // Load all family and business surveys for quick access
      this.logger.log('Loading family surveys');
      const familySurveys =
        await this.buildingSurveyRepository.findFamilySurveys();
      this.logger.log(`Loaded ${familySurveys.length} family surveys`);

      this.logger.log('Loading business surveys');
      const businessSurveys =
        await this.buildingSurveyRepository.findBusinessSurveys();
      this.logger.log(`Loaded ${businessSurveys.length} business surveys`);

      // Process building surveys in batches using cursor-based pagination
      let hasMore = true;
      let cursor: string | undefined = undefined;
      let processedCount = 0;
      let failedCount = 0;
      let batchNumber = 0;

      this.logger.log('Starting to process building surveys in batches');
      while (hasMore) {
        batchNumber++;
        this.logger.log(
          `Processing batch #${batchNumber}, cursor: ${cursor || 'initial'}`,
        );

        const result = await this.buildingSurveyRepository.findBuildingSurveys({
          cursor,
          limit: this.BATCH_SIZE,
        });

        this.logger.log(
          `Fetched ${result.data.length} building surveys in batch #${batchNumber}`,
        );

        // Update the job progress
        const totalEstimate =
          processedCount +
          result.data.length +
          (result.hasMore ? this.BATCH_SIZE : 0);
        await this.jobRepository.updateJobProgress(jobId, {
          total: totalEstimate,
          processed: processedCount,
          failed: failedCount,
        });
        this.logger.debug(
          `Updated job progress: ${processedCount}/${totalEstimate} (${failedCount} failed)`,
        );

        // Process each building
        for (let i = 0; i < result.data.length; i++) {
          const buildingData = result.data[i].data;
          try {
            this.logger.debug(
              `Processing building ${i + 1}/${result.data.length} in batch #${batchNumber}: ${buildingData.__id || 'unknown ID'}`,
            );

            // Get building token for logging
            const buildingToken = buildingData.building_token || 'unknown';
            this.logger.debug(`Building token: ${buildingToken}`);

            // Use the building processor service to process this building
            await this.buildingProcessor.processBuilding(
              buildingData,
              familySurveys,
              businessSurveys,
            );

            processedCount++;
            this.logger.debug(
              `Successfully processed building ${buildingToken}`,
            );
          } catch (error) {
            this.logger.error(
              `Error processing building ${buildingData.__id || 'unknown ID'}: ${
                error instanceof Error ? error.message : 'Unknown error'
              }`,
              error instanceof Error ? error.stack : undefined,
            );
            failedCount++;
          }

          // Update progress after each building
          await this.jobRepository.updateJobProgress(jobId, {
            processed: processedCount,
            failed: failedCount,
          });
        }

        // Move cursor for next batch
        cursor = result.nextCursor;
        hasMore = result.hasMore;
        this.logger.log(
          `Completed batch #${batchNumber}, next cursor: ${cursor || 'none'}, has more: ${hasMore}`,
        );
      }

      // Complete the job
      await this.jobRepository.completeJob(jobId);
      this.logger.log(
        `Aggregation job ${jobId} completed successfully. Processed ${processedCount} buildings with ${failedCount} failures.`,
      );
    } catch (error) {
      this.logger.error(
        `Critical error in aggregation process: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      await this.jobRepository.failJob(jobId);
      throw error;
    }
  }
}
