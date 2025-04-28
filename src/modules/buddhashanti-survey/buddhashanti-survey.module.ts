import { Module } from '@nestjs/common';
import { AggregationController } from './controllers/aggregation.controller';
import { BuildingAggregateServiceImpl } from './services/building.aggregate.service';
import { ParserServiceImpl } from './services/parser.service';
import { JobRepositoryImpl } from './repository/job.repository';
import { BuildingSurveyRepositoryImpl } from './repository/building.form.repository';
import { BuildingAggregateRepositoryImpl } from './repository/building.aggregate.repository';

import {
  JOB_REPOSITORY,
  BUILDING_SURVEY_REPOSITORY,
  BUILDING_AGGREGATE_REPOSITORY,
  PARSER_SERVICE,
  BUILDING_AGGREGATE_SERVICE,
} from './interfaces/tokens';

@Module({
  imports: [],
  controllers: [AggregationController],
  providers: [
    {
      provide: JOB_REPOSITORY,
      useClass: JobRepositoryImpl,
    },
    {
      provide: BUILDING_SURVEY_REPOSITORY,
      useClass: BuildingSurveyRepositoryImpl,
    },
    {
      provide: BUILDING_AGGREGATE_REPOSITORY,
      useClass: BuildingAggregateRepositoryImpl,
    },
    {
      provide: PARSER_SERVICE,
      useClass: ParserServiceImpl,
    },
    {
      provide: BUILDING_AGGREGATE_SERVICE,
      useClass: BuildingAggregateServiceImpl,
    },
  ],
  exports: [BUILDING_AGGREGATE_SERVICE, PARSER_SERVICE],
})
export class BuddhashantiSurveyModule {}
