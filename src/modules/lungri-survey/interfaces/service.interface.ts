import { Job } from './job.interface';
import { HouseholdData } from '../model/household-data.model';
import { BusinessData } from '../model/business-data.model';
import { SurveyData } from '@app/modules/drizzle/lungri-db/schema';
import { RawBuildingData } from '../../odk/lungri-services/parser/parse-buildings';
import { RawFamily } from '../../odk/lungri-services/parser/family/types';
import { RawBusiness } from '../../odk/lungri-services/parser/business/types';

export interface AggregationResult {
  jobId: string;
  status: string;
  message: string;
}

export interface ParserService {
  parseBuilding(
    buildingData: Record<string, any> | SurveyData<RawBuildingData>,
  ): Promise<{
    buildingToken: string;
    wardNumber: number;
    areaCode: number;
    locality: string;
    [key: string]: any;
  }>;

  parseHousehold(
    householdData: Record<string, any> | SurveyData<RawFamily>,
  ): Promise<HouseholdData>;

  parseBusiness(
    businessData: Record<string, any> | SurveyData<RawBusiness>,
  ): Promise<BusinessData>;

  /**
   * Multi-tier token matching system
   * @param token1 First token to compare
   * @param token2 Second token to compare
   * @returns Number indicating match level: 3 (exact), 2 (normalized), 1 (character count), 0 (no match)
   */
  matchTokens(token1: string, token2: string): number;
}

export interface BuildingAggregateService {
  startAggregation(userId?: string): Promise<AggregationResult>;
  getAggregationStatus(): Promise<Job | null>;
  stopAggregation(jobId: string): Promise<boolean>;
}
