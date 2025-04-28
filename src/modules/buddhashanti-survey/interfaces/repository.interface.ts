import {
  HouseholdData,
  BusinessData,
} from '../model/buddhashanti-aggregate-buildings';

export interface PaginationOptions {
  cursor?: string;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface BuildingData {
  id: string;
  formId: string;
  data: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface FamilyData {
  id: string;
  formId: string;
  data: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface BusinessFormData {
  id: string;
  formId: string;
  data: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface BuildingSurveyRepository {
  findBuildingSurveys(
    options: PaginationOptions,
  ): Promise<PaginatedResult<BuildingData>>;
  findFamilySurveys(): Promise<FamilyData[]>;
  findBusinessSurveys(): Promise<BusinessFormData[]>;
}

export interface BuildingAggregateRepository {
  saveAggregateBuilding(buildingData: {
    id: string;
    buildingId: string;
    buildingToken: string;
    wardNumber: number;
    areaCode: number;
    locality: string;
    totalFamilies: number;
    totalBusinesses: number;
    // Other required fields from schema
    households: HouseholdData[];
    businesses: BusinessData[];
    [key: string]: any;
  }): Promise<void>;

  findByBuildingToken(buildingToken: string): Promise<any | null>;
  updateAggregateBuilding(id: string, data: Partial<any>): Promise<void>;
}
