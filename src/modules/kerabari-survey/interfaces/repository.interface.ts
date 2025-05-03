import {
  kerabariAggregateBuilding,
  NewkerabariAggregateBuilding,
} from '../model/kerabari-aggregate-buildings';
import { RawBuildingData } from '../../odk/kerabari-services/parser/parse-buildings';
import { RawFamily } from '../../odk/kerabari-services/parser/family/types';
import { RawBusiness } from '../../odk/kerabari-services/parser/business/types';
import { SurveyData } from '@app/modules/drizzle/kerabari-db/schema';

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
    buildingData: NewkerabariAggregateBuilding,
  ): Promise<void>;
  findByBuildingToken(
    buildingToken: string,
  ): Promise<kerabariAggregateBuilding | null>;
  findById(id: string): Promise<kerabariAggregateBuilding | null>;
  updateAggregateBuilding(
    id: string,
    data: Partial<kerabariAggregateBuilding>,
  ): Promise<void>;
}
