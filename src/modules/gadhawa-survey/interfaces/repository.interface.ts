import {
  gadhawaAggregateBuilding,
  NewgadhawaAggregateBuilding,
} from '../model/gadhawa-aggregate-buildings';
import { RawBuildingData } from '../../odk/gadhawa-services/parser/parse-buildings';
import { RawFamily } from '../../odk/gadhawa-services/parser/family/types';
import { RawBusiness } from '../../odk/gadhawa-services/parser/business/types';
import { SurveyData } from '@app/modules/drizzle/gadhawa-db/schema';

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
    buildingData: NewgadhawaAggregateBuilding,
  ): Promise<void>;
  findByBuildingToken(
    buildingToken: string,
  ): Promise<gadhawaAggregateBuilding | null>;
  findById(id: string): Promise<gadhawaAggregateBuilding | null>;
  updateAggregateBuilding(
    id: string,
    data: Partial<gadhawaAggregateBuilding>,
  ): Promise<void>;
}
