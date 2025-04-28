import { Module } from '@nestjs/common';
import { AggregationController } from './controllers/aggregation.controller';
import { BuildingAggregateService } from './services/building.aggregate.service';
import { ParserServiceImpl } from './services/parser.service';
import { JobRepositoryImpl } from './repository/job.repository';
import { BuildingSurveyRepositoryImpl } from './repository/building.form.repository';
import { BuildingAggregateRepositoryImpl } from './repository/building.aggregate.repository';

@Module({
  imports: [],
  controllers: [AggregationController],
  providers: [
    JobRepositoryImpl,
    BuildingSurveyRepositoryImpl,
    BuildingAggregateRepositoryImpl,
    ParserServiceImpl,
    BuildingAggregateService,
  ],
  exports: [BuildingAggregateService, ParserServiceImpl],
})
export class BuddhashantiSurveyModule {}
