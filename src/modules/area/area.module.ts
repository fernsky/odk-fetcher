import { Module } from '@nestjs/common';
import { AreaService } from './services/area.service';
import { AreaController } from './controllers/area.controller';

@Module({
  controllers: [AreaController],
  providers: [AreaService],
  exports: [AreaService],
})
export class AreaModule {}
