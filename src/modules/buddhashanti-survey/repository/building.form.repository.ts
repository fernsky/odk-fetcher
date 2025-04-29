import { Injectable, Logger } from '@nestjs/common';
import {
  BuildingSurveyRepository,
  PaginationOptions,
  PaginatedResult,
} from '../interfaces/repository.interface';
import { buddhashantiDb } from '../../../modules/drizzle/buddhashanti-db';
import { eq, gt, and } from 'drizzle-orm';

// Import the correct type definitions
import { SurveyData } from '@app/modules/drizzle/buddhashanti-db/schema';
import { RawBuildingData } from '../../odk/buddhashanti-services/parser/parse-buildings';
import { RawFamily } from '../../odk/buddhashanti-services/parser/family/types';
import { RawBusiness } from '../../odk/buddhashanti-services/parser/business/types';

// Import the survey data schema
import { surveyData } from '@app/modules/drizzle/buddhashanti-db/schema';

@Injectable()
export class BuildingSurveyRepositoryImpl implements BuildingSurveyRepository {
  private readonly logger = new Logger(BuildingSurveyRepositoryImpl.name);

  async findBuildingSurveys(
    options: PaginationOptions,
  ): Promise<PaginatedResult<SurveyData<RawBuildingData>>> {
    this.logger.debug(
      `Finding building surveys with options: ${JSON.stringify(options)}`,
    );
    const { cursor, limit } = options;

    // Create the query
    const query = buddhashantiDb
      .select()
      .from(surveyData)
      .where(
        cursor
          ? and(
              eq(surveyData.formId, 'buddhashanti_building_survey'),
              gt(surveyData.id, cursor),
            )
          : eq(surveyData.formId, 'buddhashanti_building_survey'),
      )
      .orderBy(surveyData.id);

    this.logger.debug('Executing building surveys query');
    // Add limit + 1 to check if there are more results
    const surveys = await query.limit(limit + 1);

    this.logger.debug(`Retrieved ${surveys.length} building surveys`);

    const hasMore = surveys.length > limit;
    const data = hasMore ? surveys.slice(0, limit) : surveys;
    const nextCursor = hasMore ? data[data.length - 1].id : undefined;

    // Cast the data to the correct type
    const buildingSurveys = data as unknown as SurveyData<RawBuildingData>[];

    return {
      data: buildingSurveys,
      nextCursor,
      hasMore,
    };
  }

  async findFamilySurveys(): Promise<SurveyData<RawFamily>[]> {
    this.logger.debug('Finding all family surveys');

    const surveys = await buddhashantiDb
      .select()
      .from(surveyData)
      .where(eq(surveyData.formId, 'buddhashanti_family_survey'))
      .orderBy(surveyData.created_at);

    this.logger.debug(`Retrieved ${surveys.length} family surveys`);

    // Cast the data to the correct type
    return surveys as unknown as SurveyData<RawFamily>[];
  }

  async findBusinessSurveys(): Promise<SurveyData<RawBusiness>[]> {
    this.logger.debug('Finding all business surveys');

    const surveys = await buddhashantiDb
      .select()
      .from(surveyData)
      .where(eq(surveyData.formId, 'buddhashanti_business_survey'))
      .orderBy(surveyData.created_at);

    this.logger.debug(`Retrieved ${surveys.length} business surveys`);

    // Cast the data to the correct type
    return surveys as unknown as SurveyData<RawBusiness>[];
  }
}
