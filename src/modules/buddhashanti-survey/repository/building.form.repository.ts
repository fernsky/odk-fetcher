import { Injectable } from '@nestjs/common';
import {
  BuildingSurveyRepository,
  PaginationOptions,
  PaginatedResult,
  BuildingData,
  FamilyData,
  BusinessFormData,
} from '../interfaces/repository.interface';
import { buddhashantiDb } from '../../../modules/drizzle/buddhashanti-db';
import { eq, gt, and } from 'drizzle-orm';

// We need to define or import acmeOdkSurveyData from the schema
import { surveyData } from '@app/modules/drizzle/buddhashanti-db/schema';

@Injectable()
export class BuildingSurveyRepositoryImpl implements BuildingSurveyRepository {
  async findBuildingSurveys(
    options: PaginationOptions,
  ): Promise<PaginatedResult<BuildingData>> {
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

    // Add limit + 1 to check if there are more results
    const surveys = await query.limit(limit + 1);

    const hasMore = surveys.length > limit;
    const data = hasMore ? surveys.slice(0, limit) : surveys;
    const nextCursor = hasMore ? data[data.length - 1].id : undefined;

    return {
      data,
      nextCursor,
      hasMore,
    };
  }

  async findFamilySurveys(): Promise<FamilyData[]> {
    const surveys = await buddhashantiDb
      .select()
      .from(surveyData)
      .where(eq(surveyData.formId, 'buddhashanti_family_survey'))
      .orderBy(surveyData.created_at);

    return surveys;
  }

  async findBusinessSurveys(): Promise<BusinessFormData[]> {
    const surveys = await buddhashantiDb
      .select()
      .from(surveyData)
      .where(eq(surveyData.formId, 'buddhashanti_business_survey'))
      .orderBy(surveyData.created_at);

    return surveys;
  }
}
