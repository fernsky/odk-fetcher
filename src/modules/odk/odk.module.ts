import { Module } from '@nestjs/common';
import { OdkController } from './odk.controller';
import { OdkService } from './odk.service';

@Module({
  controllers: [OdkController],
  providers: [OdkService],
})
export class OdkModule {}
