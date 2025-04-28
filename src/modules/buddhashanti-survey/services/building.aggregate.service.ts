import { Injectable, Logger, ConflictException } from '@nestjs/common';
import {
  BuildingAggregateService,
  AggregationResult,
} from '../interfaces/service.interface';
import { JobRepository, JobStatus } from '../interfaces/job.interface';
import { BuildingSurveyRepository } from '../interfaces/repository.interface';
import { BuildingAggregateRepository } from '../interfaces/repository.interface';
import { ParserService } from '../interfaces/service.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BuildingAggregateServiceImpl implements BuildingAggregateService {
  private readonly logger = new Logger(BuildingAggregateServiceImpl.name);
  private readonly JOB_TYPE = 'BUILDING_AGGREGATION';
  private readonly SIMILARITY_THRESHOLD = 0.2;
  private readonly BATCH_SIZE = 50;

  constructor(
    private jobRepository: JobRepository,
    private buildingSurveyRepository: BuildingSurveyRepository,
    private buildingAggregateRepository: BuildingAggregateRepository,
    private parserService: ParserService,
  ) {}

  async startAggregation(userId?: string): Promise<AggregationResult> {
    // Check if there's an active job
    const activeJob = await this.jobRepository.getActiveJob(this.JOB_TYPE);
    if (activeJob) {
      throw new ConflictException('An aggregation job is already in progress');
    }

    // Create a new job
    const job = await this.jobRepository.createJob(this.JOB_TYPE, userId);

    // Start the aggregation process in the background
    this.processAggregation(job.id).catch((error) => {
      this.logger.error(
        `Aggregation job ${job.id} failed: ${error.message}`,
        error instanceof Error ? error.stack : undefined,
      );
      this.jobRepository.failJob(job.id, error.message);
    });

    return {
      jobId: job.id,
      status: job.status,
      message: 'Aggregation process started',
    };
  }

  async getAggregationStatus() {
    return this.jobRepository.getActiveJob(this.JOB_TYPE);
  }

  async stopAggregation(jobId: string): Promise<boolean> {
    const job = await this.jobRepository.failJob(jobId, 'Job stopped by user');
    return job.status === JobStatus.FAILED;
  }

  private async processAggregation(jobId: string): Promise<void> {
    try {
      // Update job status to running
      await this.jobRepository.updateJobStatus(jobId, JobStatus.RUNNING);

      // Load all family and business surveys for quick access
      this.logger.log('Loading family and business surveys');
      const familySurveys =
        await this.buildingSurveyRepository.findFamilySurveys();
      const businessSurveys =
        await this.buildingSurveyRepository.findBusinessSurveys();

      // Process building surveys in batches using cursor-based pagination
      let hasMore = true;
      let cursor: string | undefined = undefined;
      let processedCount = 0;
      let failedCount = 0;

      while (hasMore) {
        const result = await this.buildingSurveyRepository.findBuildingSurveys({
          cursor,
          limit: this.BATCH_SIZE,
        });

        // Update the job progress
        await this.jobRepository.updateJobProgress(jobId, {
          total:
            processedCount +
            result.data.length +
            (result.hasMore ? this.BATCH_SIZE : 0),
          processed: processedCount,
          failed: failedCount,
        });

        // Process each building
        for (const buildingData of result.data) {
          try {
            await this.processBuilding(
              buildingData,
              familySurveys,
              businessSurveys,
            );
            processedCount++;
          } catch (error) {
            this.logger.error(
              `Error processing building ${buildingData.id}: ${
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
      }

      // Complete the job
      await this.jobRepository.completeJob(jobId);
      this.logger.log(`Aggregation job ${jobId} completed successfully`);
    } catch (error) {
      this.logger.error(
        `Error in aggregation process: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      await this.jobRepository.failJob(
        jobId,
        error instanceof Error ? error.message : 'Unknown error',
      );
      throw error;
    }
  }

  private async processBuilding(
    buildingData: any,
    familySurveys: any[],
    businessSurveys: any[],
  ): Promise<void> {
    // Parse the building data
    const parsedBuilding = await this.parserService.parseBuilding(buildingData);
    const buildingToken = parsedBuilding.buildingToken;

    // Find matching families
    const matchingFamilies = await this.findMatchingFamilies(
      buildingToken,
      familySurveys,
    );

    // Find matching businesses
    const matchingBusinesses = await this.findMatchingBusinesses(
      buildingToken,
      businessSurveys,
    );

    // Create the aggregate data
    const aggregatedData = {
      id: uuidv4(),
      buildingId: buildingData.id,
      ...parsedBuilding,
      totalFamilies: matchingFamilies.length,
      totalBusinesses: matchingBusinesses.length,
      households: matchingFamilies,
      businesses: matchingBusinesses,
    };

    // Save or update the aggregated building
    await this.buildingAggregateRepository.saveAggregateBuilding(
      aggregatedData,
    );
  }

  private async findMatchingFamilies(
    buildingToken: string,
    familySurveys: any[],
  ): Promise<any[]> {
    const matchingFamilies = [];

    for (const familyData of familySurveys) {
      try {
        const familyBuildingToken = familyData.data?.building_token;

        // Check for direct match or similarity
        if (
          familyBuildingToken === buildingToken ||
          (familyBuildingToken &&
            buildingToken &&
            this.parserService.calculateSimilarityScore(
              familyBuildingToken,
              buildingToken,
            ) > this.SIMILARITY_THRESHOLD)
        ) {
          const parsedHousehold =
            await this.parserService.parseHousehold(familyData);
          matchingFamilies.push(parsedHousehold);
        }
      } catch (error) {
        this.logger.warn(
          `Error processing family ${familyData.id}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }
    }

    return matchingFamilies;
  }

  private async findMatchingBusinesses(
    buildingToken: string,
    businessSurveys: any[],
  ): Promise<any[]> {
    const matchingBusinesses = [];

    for (const businessData of businessSurveys) {
      try {
        const businessBuildingToken = businessData.data?.building_token;

        // Check for direct match or similarity
        if (
          businessBuildingToken === buildingToken ||
          (businessBuildingToken &&
            buildingToken &&
            this.parserService.calculateSimilarityScore(
              businessBuildingToken,
              buildingToken,
            ) > this.SIMILARITY_THRESHOLD)
        ) {
          const parsedBusiness =
            await this.parserService.parseBusiness(businessData);
          matchingBusinesses.push(parsedBusiness);
        }
      } catch (error) {
        this.logger.warn(
          `Error processing business ${businessData.id}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }
    }

    return matchingBusinesses;
  }
}
