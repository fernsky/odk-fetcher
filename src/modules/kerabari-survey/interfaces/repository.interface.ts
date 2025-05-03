import {
  KerabariAggregateBuilding,
  NewKerabariAggregateBuilding,
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
    buildingData: NewKerabariAggregateBuilding,
  ): Promise<void>;
  findByBuildingToken(
    buildingToken: string,
  ): Promise<KerabariAggregateBuilding | null>;
  findById(id: string): Promise<KerabariAggregateBuilding | null>;
  updateAggregateBuilding(
    id: string,
    data: Partial<KerabariAggregateBuilding>,
  ): Promise<void>;
}
