import { Injectable, Logger } from '@nestjs/common';
import { RawBuildingData } from '../../../odk/gadhawa-services/parser/parse-buildings';
import { SurveyData } from '@app/modules/drizzle/gadhawa-db/schema';
import { RawFamily } from '../../../odk/gadhawa-services/parser/family/types';
import { RawBusiness } from '../../../odk/gadhawa-services/parser/business/types';
import { ParserServiceImpl } from '../parser.service';
import { BusinessMatcherService } from '../matchers/business-matcher.service';
import { FamilyMatcherService } from '../matchers/family-matcher.service';
import { BuildingAggregateRepositoryImpl } from '../../repository/building.aggregate.repository';

@Injectable()
export class BuildingProcessorService {
  private readonly logger = new Logger(BuildingProcessorService.name);

  constructor(
    private buildingAggregateRepository: BuildingAggregateRepositoryImpl,
    private parserService: ParserServiceImpl,
    private familyMatcher: FamilyMatcherService,
    private businessMatcher: BusinessMatcherService,
  ) {}

  async processBuilding(
    buildingData: RawBuildingData,
    familySurveys: SurveyData<RawFamily>[],
    businessSurveys: SurveyData<RawBusiness>[],
  ): Promise<void> {
    const buildingId = buildingData.__id || 'unknown';
    this.logger.log(`Processing building with ID: ${buildingId}`);

    // Parse the building data
    this.logger.debug('Parsing building data');
    const parsedBuilding = await this.parserService.parseBuilding(buildingData);
    const buildingToken = parsedBuilding.building_token;

    this.logger.log(
      `Building token: ${buildingToken}, Ward: ${parsedBuilding.wardNumber}, Locality: ${parsedBuilding.locality}`,
    );

    // Find matching families
    this.logger.debug(
      `Searching for families matching building token: ${buildingToken}`,
    );
    const matchingFamilies = await this.familyMatcher.findMatchingFamilies(
      buildingToken,
      familySurveys,
    );
    this.logger.log(
      `Found ${matchingFamilies.length} matching families for building ${buildingToken}`,
    );

    // Find matching businesses
    this.logger.debug(
      `Searching for businesses matching building token: ${buildingToken}`,
    );
    const matchingBusinesses =
      await this.businessMatcher.findMatchingBusinesses(
        buildingToken,
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
      building_id: buildingId,
      ...parsedBuilding,
      households: JSON.stringify(matchingFamilies),
      businesses: JSON.stringify(matchingBusinesses),
      // Make sure the counts match what we found
      total_families: matchingFamilies.length,
      total_businesses: matchingBusinesses.length,
    };

    // Log data summary
    this.logger.debug(`Aggregated data summary:
      - Building ID: ${aggregatedData.id}
      - Source Building ID: ${aggregatedData.building_id}
      - Ward: ${aggregatedData.ward_number}
      - Locality: ${aggregatedData.locality}
      - Families: ${aggregatedData.total_families}
      - Businesses: ${aggregatedData.total_businesses}
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
}
