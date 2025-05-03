import { Module } from '@nestjs/common';
import { AggregationController } from './controllers/aggregation.controller';
import { BuildingAggregateService } from './services/building.aggregate.service';
import { ParserServiceImpl } from './services/parser.service';
import { JobRepositoryImpl } from './repository/job.repository';
import { BuildingSurveyRepositoryImpl } from './repository/building.form.repository';
import { BuildingAggregateRepositoryImpl } from './repository/building.aggregate.repository';
import { BuildingParserService } from './services/parsers/building-parser.service';
import { HouseholdParserService } from './services/parsers/household-parser.service';
import { BusinessParserService } from './services/parsers/business-parser.service';
import { BusinessMatcherService } from './services/matchers/business-matcher.service';
import { FamilyMatcherService } from './services/matchers/family-matcher.service';
import { BuildingProcessorService } from './services/processors/building-processor.service';

@Module({
  imports: [],
  controllers: [AggregationController],
  providers: [
    JobRepositoryImpl,
    BuildingSurveyRepositoryImpl,
    BuildingAggregateRepositoryImpl,
    BuildingParserService,
    HouseholdParserService,
    BusinessParserService,
    ParserServiceImpl,
    BusinessMatcherService,
    FamilyMatcherService,
    BuildingProcessorService,
    BuildingAggregateService,
  ],
  exports: [BuildingAggregateService, ParserServiceImpl],
})
export class KerabariSurveyModule {}
