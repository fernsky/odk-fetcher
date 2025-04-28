import { Job } from './job.interface';
import {
  HouseholdData,
  BusinessData,
} from '../model/buddhashanti-aggregate-buildings';

export interface AggregationResult {
  jobId: string;
  status: string;
  message: string;
}

export interface ParserService {
  parseBuilding(buildingData: Record<string, any>): Promise<{
    buildingToken: string;
    wardNumber: number;
    areaCode: number;
    locality: string;
    [key: string]: any;
  }>;

  parseHousehold(householdData: Record<string, any>): Promise<HouseholdData>;
  parseBusiness(businessData: Record<string, any>): Promise<BusinessData>;
  calculateSimilarityScore(token1: string, token2: string): number;
}

export interface BuildingAggregateService {
  startAggregation(userId?: string): Promise<AggregationResult>;
  getAggregationStatus(): Promise<Job | null>;
  stopAggregation(jobId: string): Promise<boolean>;
}
