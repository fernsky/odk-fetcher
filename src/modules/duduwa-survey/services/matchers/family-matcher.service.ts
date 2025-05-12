import { Injectable, Logger } from '@nestjs/common';
import { SurveyData } from '@app/modules/drizzle/duduwa-db/schema';
import { RawFamily } from '../../../odk/duduwa-services/parser/family/types';
import { ParserServiceImpl } from '../parser.service';

@Injectable()
export class FamilyMatcherService {
  private readonly logger = new Logger(FamilyMatcherService.name);

  constructor(private readonly parserService: ParserServiceImpl) {}

  async findMatchingFamilies(
    buildingToken: string,
    familySurveys: SurveyData<RawFamily>[],
  ): Promise<any[]> {
    this.logger.debug(
      `Searching for families matching building token: ${buildingToken}`,
    );
    const matchingFamilies = [];
    let exactMatches = 0;
    let normalizedMatches = 0;
    let frequencyMatches = 0;

    for (const familySurvey of familySurveys) {
      try {
        // Extract family data from SurveyData
        const familyData = familySurvey.data;

        // Check for token in the enumerator_introduction section based on sample data structure
        const familyBuildingToken =
          familyData?.enumerator_introduction?.building_token || '';

        // Apply multi-tier matching
        const matchLevel = this.parserService.matchTokens(
          familyBuildingToken,
          buildingToken,
        );

        // Process based on match level
        if (matchLevel >= 3) {
          // Exact match
          this.logger.debug(
            `Exact token match (Level ${matchLevel}) found for family ${
              familySurvey.id || 'unknown'
            }`,
          );
          exactMatches++;
          const parsedHousehold =
            await this.parserService.parseHousehold(familySurvey);
          matchingFamilies.push(parsedHousehold);
        } else if (matchLevel === 2) {
          // Normalized match
          this.logger.debug(
            `Normalized token match (Level ${matchLevel}) found for family ${
              familySurvey.id || 'unknown'
            }`,
          );
          normalizedMatches++;
          const parsedHousehold =
            await this.parserService.parseHousehold(familySurvey);
          matchingFamilies.push(parsedHousehold);
        } else if (matchLevel === 1) {
          // Character frequency match
          this.logger.debug(
            `Character frequency match (Level ${matchLevel}) found for family ${
              familySurvey.id || 'unknown'
            }`,
          );
          frequencyMatches++;
          const parsedHousehold =
            await this.parserService.parseHousehold(familySurvey);
          matchingFamilies.push(parsedHousehold);
        }
      } catch (error) {
        this.logger.warn(
          `Error processing family ${familySurvey.id || 'unknown'}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }
    }

    this.logger.log(
      `Family matching results for building ${buildingToken}: ` +
        `Total matches: ${matchingFamilies.length} ` +
        `(Exact: ${exactMatches}, Normalized: ${normalizedMatches}, Frequency: ${frequencyMatches})`,
    );
    return matchingFamilies;
  }
}
