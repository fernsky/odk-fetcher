import { Injectable } from '@nestjs/common';
import { ParserService } from '../interfaces/service.interface';
import { HouseholdData } from '../model/household-data.model';
import { BusinessData } from '../model/business-data.model';
import { SurveyData } from '@app/modules/drizzle/duduwa-db/schema';
import { RawBuildingData } from '../../odk/duduwa-services/parser/parse-buildings';
import { RawFamily } from '../../odk/duduwa-services/parser/family/types';
import { RawBusiness } from '../../odk/duduwa-services/parser/business/types';

import { BuildingParserService } from './parsers/building-parser.service';
import { HouseholdParserService } from './parsers/household-parser.service';
import { BusinessParserService } from './parsers/business-parser.service';

@Injectable()
export class ParserServiceImpl implements ParserService {
  constructor(
    private readonly buildingParser: BuildingParserService,
    private readonly householdParser: HouseholdParserService,
    private readonly businessParser: BusinessParserService,
  ) {}

  async parseBuilding(
    buildingData: Record<string, any> | SurveyData<RawBuildingData>,
  ): Promise<any> {
    return this.buildingParser.parseBuilding(buildingData);
  }

  async parseHousehold(
    householdData: Record<string, any> | SurveyData<RawFamily>,
  ): Promise<HouseholdData> {
    return this.householdParser.parseHousehold(householdData);
  }

  async parseBusiness(
    businessData: Record<string, any> | SurveyData<RawBusiness>,
  ): Promise<BusinessData> {
    return this.businessParser.parseBusiness(businessData);
  }

  /**
   * Multi-tier token matching system
   * @param token1 First token to compare
   * @param token2 Second token to compare
   * @returns Number indicating match level: 3 (exact), 2 (normalized), 1 (character count), 0 (no match)
   */
  matchTokens(token1: string, token2: string): number {
    return this.buildingParser.matchTokens(token1, token2);
  }
}
