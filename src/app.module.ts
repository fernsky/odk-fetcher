import {
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import {
  AllExceptionsFilter,
  ValidationExceptionFilter,
  BadRequestExceptionFilter,
  UnauthorizedExceptionFilter,
  ForbiddenExceptionFilter,
  NotFoundExceptionFilter,
} from './core/filters';
// import { UsersModule } from './modules/users/users.module';
import { UserModule } from './modules/user/user.module';
import { NestDrizzleModule } from './modules/drizzle/drizzle.module';
import { AuthModule } from './modules/auth/auth.module';
import { WardModule } from './modules/ward/ward.module';
import { AreaModule } from './modules/area/area.module';
import { OdkModule } from './modules/odk/odk.module';
import { BuddhashantiSurveyModule } from './modules/buddhashanti-survey/buddhashanti-survey.module';
import configuration from './config/configuration';
import { KerabariSurveyModule } from './modules/kerabari-survey/kerabari-survey.module';
import { GadhawaSurveyModule } from './modules/gadhawa-survey/gadhawa-survey.module';

@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 10,
      },
    ]),
    TerminusModule,
    NestDrizzleModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        driver: 'postgres-js',
        url: configService.get('DATABASE_URL'),
        options: {},
        migrationOptions: {
          migrationsFolder: './migrations',
        },
      }),
    }),
    AuthModule,
    WardModule,
    AreaModule,
    OdkModule,
    BuddhashantiSurveyModule, // Add BuddhashantiSurveyModule here
    KerabariSurveyModule, // Add KerabariSurveyModule here
    GadhawaSurveyModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_FILTER, useClass: ValidationExceptionFilter },
    { provide: APP_FILTER, useClass: BadRequestExceptionFilter },
    { provide: APP_FILTER, useClass: UnauthorizedExceptionFilter },
    { provide: APP_FILTER, useClass: ForbiddenExceptionFilter },
    { provide: APP_FILTER, useClass: NotFoundExceptionFilter },
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          exceptionFactory: (errors: ValidationError[]) => {
            return errors[0];
          },
        }),
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
