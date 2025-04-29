import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { JobStatus } from '../interfaces/job.interface';
import { JobRepositoryImpl } from '../repository/job.repository';
import { BuildingSurveyRepositoryImpl } from '../repository/building.form.repository';
import { BuildingAggregateRepositoryImpl } from '../repository/building.aggregate.repository';
import { ParserServiceImpl } from './parser.service';
import { SurveyData } from '@app/modules/drizzle/buddhashanti-db/schema';
import { RawBuildingData } from '../../odk/buddhashanti-services/parser/parse-buildings';
import { RawFamily } from '../../odk/buddhashanti-services/parser/family/types';
import { RawBusiness } from '../../odk/buddhashanti-services/parser/business/types';

@Injectable()
export class BuildingAggregateService {
  private readonly logger = new Logger(BuildingAggregateService.name);
  private readonly JOB_TYPE = 'BUILDING_AGGREGATION';
  private readonly SIMILARITY_THRESHOLD = 0.2;
  private readonly BATCH_SIZE = 50;

  constructor(
    private jobRepository: JobRepositoryImpl,
    private buildingSurveyRepository: BuildingSurveyRepositoryImpl,
    private buildingAggregateRepository: BuildingAggregateRepositoryImpl,
    private parserService: ParserServiceImpl,
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

            await this.processBuilding(
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

  private async processBuilding(
    buildingData: RawBuildingData,
    familySurveys: SurveyData<RawFamily>[],
    businessSurveys: SurveyData<RawBusiness>[],
  ): Promise<void> {
    const buildingId = buildingData.__id || 'unknown';
    this.logger.log(`Processing building with ID: ${buildingId}`);

    // Parse the building data
    this.logger.debug('Parsing building data');
    const parsedBuilding = await this.parserService.parseBuilding(buildingData);
    const buildingToken = parsedBuilding.buildingToken;

    this.logger.log(
      `Building token: ${buildingToken}, Ward: ${parsedBuilding.wardNumber}, Locality: ${parsedBuilding.locality}`,
    );

    // Find matching families
    this.logger.debug(
      `Searching for families matching building token: ${buildingToken}`,
    );
    const matchingFamilies = await this.findMatchingFamilies(
      buildingToken,
      parsedBuilding.wardNumber,
      familySurveys,
    );
    this.logger.log(
      `Found ${matchingFamilies.length} matching families for building ${buildingToken}`,
    );

    // Find matching businesses
    this.logger.debug(
      `Searching for businesses matching building token: ${buildingToken}`,
    );
    const matchingBusinesses = await this.findMatchingBusinesses(
      buildingToken,
      parsedBuilding.wardNumber,
      businessSurveys,
    );
    this.logger.log(
      `Found ${matchingBusinesses.length} matching businesses for building ${buildingToken}`,
    );

    // Use the buildingId as the aggregateId instead of generating a new UUID
    const aggregateId = buildingId;
    this.logger.debug(
      `Using building ID as aggregated building ID: ${aggregateId}`,
    );

    // Check if an aggregate with this ID already exists
    const existingAggregate =
      await this.buildingAggregateRepository.findById(aggregateId);

    if (existingAggregate) {
      this.logger.debug(
        `Found existing aggregate data for building ID: ${aggregateId}. Will replace with new data.`,
      );
    }

    const aggregatedData = {
      id: aggregateId,
      buildingId: buildingId,
      ...parsedBuilding,
      households: matchingFamilies,
      businesses: matchingBusinesses,
      // Make sure the counts match what we found
      totalFamilies: matchingFamilies.length,
      totalBusinesses: matchingBusinesses.length,
    };

    // Log data summary
    this.logger.debug(`Aggregated data summary:
      - Building ID: ${aggregatedData.id}
      - Source Building ID: ${aggregatedData.buildingId}
      - Ward: ${aggregatedData.wardNumber}
      - Locality: ${aggregatedData.locality}
      - Families: ${aggregatedData.totalFamilies}
      - Businesses: ${aggregatedData.totalBusinesses}
    `);

    // Save or update the aggregated building
    this.logger.debug(
      `Saving aggregated building to database with ID: ${aggregateId}`,
    );

    try {
      if (existingAggregate) {
        // If aggregate already exists, update it
        await this.buildingAggregateRepository.updateAggregateBuilding(
          aggregateId,
          aggregatedData,
        );
        this.logger.log(
          `Successfully updated existing aggregated building with ID: ${aggregateId}`,
        );
      } else {
        // If it's a new aggregate, save it
        await this.buildingAggregateRepository.saveAggregateBuilding(
          aggregatedData,
        );
        this.logger.log(
          `Successfully saved new aggregated building with ID: ${aggregateId}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error saving/updating aggregated building with ID ${aggregateId}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  private async findMatchingFamilies(
    buildingToken: string,
    wardNumber: number | null,
    familySurveys: SurveyData<RawFamily>[],
  ): Promise<any[]> {
    this.logger.debug(
      `Searching for families matching building token: ${buildingToken} in ward: ${wardNumber}`,
    );
    const matchingFamilies = [];
    let exactMatches = 0;
    let similarityMatches = 0;
    let wardMatches = 0;

    for (const familySurvey of familySurveys) {
      try {
        // Extract family data from SurveyData
        const familyData = familySurvey.data;

        // Check for token in the enumerator_introduction section based on sample data structure
        const familyBuildingToken =
          familyData?.enumerator_introduction?.building_token || '';

        // Also check ward number
        const familyWardNumber = familyData?.id?.ward_no || null;

        const wardMatch =
          wardNumber !== null &&
          familyWardNumber !== null &&
          wardNumber === familyWardNumber;

        // Log the check
        this.logger.debug(
          `Checking family: Token "${familyBuildingToken}" against "${buildingToken}", Ward: ${familyWardNumber}`,
        );

        // Check for direct match
        if (familyBuildingToken === buildingToken) {
          this.logger.debug(
            `Exact token match found for family ${familySurvey.id || 'unknown'}`,
          );
          exactMatches++;
          const parsedHousehold =
            await this.parserService.parseHousehold(familySurvey);
          matchingFamilies.push(parsedHousehold);
        }
        // Check for similarity if tokens don't match exactly
        else if (
          familyBuildingToken &&
          buildingToken &&
          this.parserService.calculateSimilarityScore(
            familyBuildingToken,
            buildingToken,
          ) > this.SIMILARITY_THRESHOLD
        ) {
          this.logger.debug(
            `Similarity match found for family ${familySurvey.id || 'unknown'}`,
          );
          similarityMatches++;
          const parsedHousehold =
            await this.parserService.parseHousehold(familySurvey);
          matchingFamilies.push(parsedHousehold);
        }
        // If no token match but ward matches, consider it as well
        else if (
          wardMatch &&
          !matchingFamilies.some((f) => f.id === familySurvey.id)
        ) {
          this.logger.debug(
            `Ward match found for family ${familySurvey.id || 'unknown'}`,
          );
          wardMatches++;
          const parsedHousehold =
            await this.parserService.parseHousehold(familySurvey);
          matchingFamilies.push(parsedHousehold);
        }
      } catch (error) {
        this.logger.warn(
          `Error processing family ${familySurvey.id || 'unknown'}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }
    }

    this.logger.log(
      `Family matching results for building ${buildingToken}: ` +
        `Total matches: ${matchingFamilies.length} ` +
        `(Exact: ${exactMatches}, Similarity: ${similarityMatches}, Ward: ${wardMatches})`,
    );
    return matchingFamilies;
  }

  private async findMatchingBusinesses(
    buildingToken: string,
    wardNumber: number | null,
    businessSurveys: SurveyData<RawBusiness>[],
  ): Promise<any[]> {
    this.logger.debug(
      `Searching for businesses matching building token: ${buildingToken} in ward: ${wardNumber}`,
    );
    const matchingBusinesses = [];
    let exactMatches = 0;
    let similarityMatches = 0;
    let wardMatches = 0;

    for (const businessSurvey of businessSurveys) {
      try {
        // Extract business data from SurveyData
        const businessData = businessSurvey.data;

        // Check for token in the enumerator_introduction section based on sample data structure
        const businessBuildingToken =
          businessData?.enumerator_introduction?.building_token_number || '';

        // Also check ward matching
        const businessWardNumber = businessData?.b_addr?.ward_no || null;

        const wardMatch =
          wardNumber !== null &&
          businessWardNumber !== null &&
          wardNumber === businessWardNumber;

        // Log the check
        this.logger.debug(
          `Checking business: Token "${businessBuildingToken}" against "${buildingToken}", Ward: ${businessWardNumber}`,
        );

        // Check for direct match
        if (businessBuildingToken === buildingToken) {
          this.logger.debug(
            `Exact token match found for business ${businessSurvey.id || 'unknown'}`,
          );
          exactMatches++;
          const parsedBusiness =
            await this.parserService.parseBusiness(businessSurvey);
          matchingBusinesses.push(parsedBusiness);
        }
        // Check for similarity if tokens don't match exactly
        else if (
          businessBuildingToken &&
          buildingToken &&
          this.parserService.calculateSimilarityScore(
            businessBuildingToken,
            buildingToken,
          ) > this.SIMILARITY_THRESHOLD
        ) {
          this.logger.debug(
            `Similarity match found for business ${businessSurvey.id || 'unknown'}`,
          );
          similarityMatches++;
          const parsedBusiness =
            await this.parserService.parseBusiness(businessSurvey);
          matchingBusinesses.push(parsedBusiness);
        }
        // If no token match but ward matches, consider it as well
        else if (
          wardMatch &&
          !matchingBusinesses.some((b) => b.id === businessSurvey.id)
        ) {
          this.logger.debug(
            `Ward match found for business ${businessSurvey.id || 'unknown'}`,
          );
          wardMatches++;
          const parsedBusiness =
            await this.parserService.parseBusiness(businessSurvey);
          matchingBusinesses.push(parsedBusiness);
        }
      } catch (error) {
        this.logger.warn(
          `Error processing business ${businessSurvey.id || 'unknown'}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }
    }

    this.logger.log(
      `Business matching results for building ${buildingToken}: ` +
        `Total matches: ${matchingBusinesses.length} ` +
        `(Exact: ${exactMatches}, Similarity: ${similarityMatches}, Ward: ${wardMatches})`,
    );
    return matchingBusinesses;
  }
}
