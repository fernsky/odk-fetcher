import { Injectable, Logger } from '@nestjs/common';
import { SurveyData } from '@app/modules/drizzle/kerabari-db/schema';
import { RawBusiness } from '../../../odk/kerabari-services/parser/business/types';
import { ParserServiceImpl } from '../parser.service';

@Injectable()
export class BusinessMatcherService {
  private readonly logger = new Logger(BusinessMatcherService.name);

  constructor(private readonly parserService: ParserServiceImpl) {}

  async findMatchingBusinesses(
    buildingToken: string,
    businessSurveys: SurveyData<RawBusiness>[],
  ): Promise<any[]> {
    this.logger.debug(
      `Searching for businesses matching building token: ${buildingToken}`,
    );
    const matchingBusinesses = [];
    let exactMatches = 0;
    let normalizedMatches = 0;
    let frequencyMatches = 0;

    for (const businessSurvey of businessSurveys) {
      try {
        // Extract business data from SurveyData
        const businessData = businessSurvey.data;

        // Check for token in the enumerator_introduction section based on sample data structure
        const businessBuildingToken =
          businessData?.enumerator_introduction?.building_token_number || '';

        // Apply multi-tier matching
        const matchLevel = this.parserService.matchTokens(
          businessBuildingToken,
          buildingToken,
        );

        // Process based on match level
        if (matchLevel >= 3) {
          // Exact match
          this.logger.debug(
            `Exact token match (Level ${matchLevel}) found for business ${
              businessSurvey.id || 'unknown'
            }`,
          );
          exactMatches++;
          const parsedBusiness =
            await this.parserService.parseBusiness(businessSurvey);
          matchingBusinesses.push(parsedBusiness);
        } else if (matchLevel === 2) {
          // Normalized match
          this.logger.debug(
            `Normalized token match (Level ${matchLevel}) found for business ${
              businessSurvey.id || 'unknown'
            }`,
          );
          normalizedMatches++;
          const parsedBusiness =
            await this.parserService.parseBusiness(businessSurvey);
          matchingBusinesses.push(parsedBusiness);
        } else if (matchLevel === 1) {
          // Character frequency match
          this.logger.debug(
            `Character frequency match (Level ${matchLevel}) found for business ${
              businessSurvey.id || 'unknown'
            }`,
          );
          frequencyMatches++;
          const parsedBusiness =
            await this.parserService.parseBusiness(businessSurvey);
          matchingBusinesses.push(parsedBusiness);
        }
      } catch (error) {
        this.logger.warn(
          `Error processing business ${businessSurvey.id || 'unknown'}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }
    }

    this.logger.log(
      `Business matching results for building ${buildingToken}: ` +
        `Total matches: ${matchingBusinesses.length} ` +
        `(Exact: ${exactMatches}, Normalized: ${normalizedMatches}, Frequency: ${frequencyMatches})`,
    );
    return matchingBusinesses;
  }
}
