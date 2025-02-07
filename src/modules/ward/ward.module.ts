import { Module } from '@nestjs/common';
import { WardController } from './ward.controller';
import { WardService } from './ward.service';
import { JwtModule } from '@nestjs/jwt';
import { NestDrizzleModule } from '../drizzle/drizzle.module';

@Module({
  imports: [
    NestDrizzleModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [WardController],
  providers: [WardService],
  exports: [WardService],
})
export class WardModule {}
