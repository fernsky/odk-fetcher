import {
  BuddhashantiAggregateBuilding,
  NewBuddhashantiAggregateBuilding,
} from '../model/buddhashanti-aggregate-buildings';
import { RawBuildingData } from '../../odk/buddhashanti-services/parser/parse-buildings';
import { RawFamily } from '../../odk/buddhashanti-services/parser/family/types';
import { RawBusiness } from '../../odk/buddhashanti-services/parser/business/types';
import { SurveyData } from '@app/modules/drizzle/buddhashanti-db/schema';

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
    buildingData: NewBuddhashantiAggregateBuilding,
  ): Promise<void>;
  findByBuildingToken(
    buildingToken: string,
  ): Promise<BuddhashantiAggregateBuilding | null>;
  findById(id: string): Promise<BuddhashantiAggregateBuilding | null>;
  updateAggregateBuilding(
    id: string,
    data: Partial<BuddhashantiAggregateBuilding>,
  ): Promise<void>;
}
