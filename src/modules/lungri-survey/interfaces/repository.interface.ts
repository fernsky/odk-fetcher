import {
  lungriAggregateBuilding,
  NewlungriAggregateBuilding,
} from '../model/lungri-aggregate-buildings';
import { RawBuildingData } from '../../odk/lungri-services/parser/parse-buildings';
import { RawFamily } from '../../odk/lungri-services/parser/family/types';
import { RawBusiness } from '../../odk/lungri-services/parser/business/types';
import { SurveyData } from '@app/modules/drizzle/lungri-db/schema';

export interface PaginationOptions {
  cursor?: string;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
}

// Use the correct raw data types from the parser modules
export interface BuildingSurveyRepository {
  findBuildingSurveys(
    options: PaginationOptions,
  ): Promise<PaginatedResult<SurveyData<RawBuildingData>>>;
  findFamilySurveys(): Promise<SurveyData<RawFamily>[]>;
  findBusinessSurveys(): Promise<SurveyData<RawBusiness>[]>;
}

export interface BuildingAggregateRepository {
  saveAggregateBuilding(
    buildingData: NewlungriAggregateBuilding,
  ): Promise<void>;
  findByBuildingToken(
    buildingToken: string,
  ): Promise<lungriAggregateBuilding | null>;
  findById(id: string): Promise<lungriAggregateBuilding | null>;
  updateAggregateBuilding(
    id: string,
    data: Partial<lungriAggregateBuilding>,
  ): Promise<void>;
}
