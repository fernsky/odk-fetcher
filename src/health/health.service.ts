import { Injectable, Logger } from '@nestjs/common';
import {
  HealthCheckResult,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { DrizzleService } from '../modules/drizzle/drizzle.service';
import { users } from '../modules/drizzle/schema';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private db: DrizzleService,
  ) {}

  async check(): Promise<HealthCheckResult> {
    try {
      return await this.health.check([
        () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
        () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
        () =>
          this.disk.checkStorage('disk', {
            path: '/',
            thresholdPercent: 0.95,
          }),
        async () => this.checkDatabase(),
      ]);
    } catch (error) {
      //@ts-expect-error Zod related issue
      this.logger.error(`Health check failed: ${error.message}`);
      throw error;
    }
  }

  private async checkDatabase(): Promise<HealthIndicatorResult> {
    try {
      const db = await this.db.getDrizzle();
      await db.select().from(users).limit(1);
      return {
        database: {
          status: 'up',
        },
      };
    } catch (error) {
      //@ts-expect-error Zod related issue
      this.logger.error(`Database health check failed: ${error.message}`);
      return {
        database: {
          status: 'down',
          //@ts-expect-error Zod related issue
          message: error.message,
        },
      };
    }
  }
}
