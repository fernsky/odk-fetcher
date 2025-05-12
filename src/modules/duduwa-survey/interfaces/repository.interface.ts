import {
  duduwaAggregateBuilding,
  NewduduwaAggregateBuilding,
} from '../model/duduwa-aggregate-buildings';
import { RawBuildingData } from '../../odk/duduwa-services/parser/parse-buildings';
import { RawFamily } from '../../odk/duduwa-services/parser/family/types';
import { RawBusiness } from '../../odk/duduwa-services/parser/business/types';
import { SurveyData } from '@app/modules/drizzle/duduwa-db/schema';

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
    buildingData: NewduduwaAggregateBuilding,
  ): Promise<void>;
  findByBuildingToken(
    buildingToken: string,
  ): Promise<duduwaAggregateBuilding | null>;
  findById(id: string): Promise<duduwaAggregateBuilding | null>;
  updateAggregateBuilding(
    id: string,
    data: Partial<duduwaAggregateBuilding>,
  ): Promise<void>;
}
