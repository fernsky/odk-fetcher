import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateWardDto,
  UpdateWardDto,
  WardResponseDto,
  WardSyncResponseDto,
  SyncResponseDto,
} from './dto/ward.dto';
import { eq, sql } from 'drizzle-orm';
import { wards } from '../drizzle/schema';
import { DRIZZLE_ORM } from '@app/core/constants/db.constants';
import { JwtService } from '@nestjs/jwt';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../drizzle/schema';
import { getValidSyncDate } from './utils/sync.utils';
import { SYNC_MESSAGES } from './constants/sync.constants';

@Injectable()
export class WardService {
  constructor(
    @Inject(DRIZZLE_ORM) private db: PostgresJsDatabase<typeof schema>,
    private jwtService: JwtService,
  ) {}

  async create(createWardDto: CreateWardDto): Promise<WardResponseDto> {
    try {
      const [ward] = await this.db
        .insert(wards)
        .values({
          ...createWardDto,
          geometry: createWardDto.geometry
            ? sql`ST_GeomFromGeoJSON(${JSON.stringify(createWardDto.geometry)})`
            : null,
        })
        .returning();
      return this.transformWardResponse(ward);
    } catch (error) {
      if (
        typeof error === 'object' &&
        error &&
        'code' in error &&
        error.code === '23505'
      ) {
        throw new Error('Ward number already exists');
      }
      throw error;
    }
  }

  async findAll(): Promise<WardResponseDto[]> {
    const result = await this.db.execute(
      sql`SELECT ward_number as "wardNumber", 
          ward_area_code as "wardAreaCode",
          ST_AsGeoJSON(geometry) as geometry 
          FROM ${wards} 
          ORDER BY ward_number`,
    );
    return result.map(this.transformWardResponse);
  }

  async findOne(wardNumber: number): Promise<WardResponseDto> {
    const [result] = await this.db.execute(
      sql`SELECT ward_number as "wardNumber", 
          ward_area_code as "wardAreaCode",
          ST_AsGeoJSON(geometry) as geometry 
          FROM ${wards} 
          WHERE ward_number = ${wardNumber}
          LIMIT 1`,
    );

    if (!result) {
      throw new NotFoundException(`Ward #${wardNumber} not found`);
    }

    return this.transformWardResponse(result);
  }

  async update(
    wardNumber: number,
    updateWardDto: UpdateWardDto,
  ): Promise<WardResponseDto> {
    const [updated] = await this.db
      .update(wards)
      .set({
        ...updateWardDto,
        //@ts-expect-error Drizzle related issue
        updatedAt: new Date(),
        syncStatus: 'pending',
      })
      .where(eq(wards.wardNumber, wardNumber))
      .returning();

    if (!updated) {
      throw new NotFoundException(`Ward #${wardNumber} not found`);
    }

    return this.transformWardResponse(updated);
  }

  async remove(wardNumber: number): Promise<void> {
    const result = await this.db
      .update(wards)
      .set({
        //@ts-expect-error Drizzle related issue
        deletedAt: new Date(),
        updatedAt: new Date(),
        syncStatus: 'pending',
      })
      .where(eq(wards.wardNumber, wardNumber))
      .returning();

    if (!result.length) {
      throw new NotFoundException(`Ward #${wardNumber} not found`);
    }
  }

  async getChanges(lastSyncedAt?: string): Promise<SyncResponseDto> {
    const { timestamp, message, status } = getValidSyncDate(lastSyncedAt);
    const timestampStr = timestamp.toISOString();

    const result = await this.db.execute(
      sql`SELECT 
          ward_number as "wardNumber", 
          ward_area_code as "wardAreaCode",
          ST_AsGeoJSON(geometry) as geometry,
          created_at as "createdAt",
          updated_at as "updatedAt",
          deleted_at as "deletedAt",
          sync_status as "syncStatus"
          FROM ${wards} 
          WHERE updated_at > ${timestampStr}::timestamp
          OR (deleted_at IS NOT NULL AND deleted_at > ${timestampStr}::timestamp)
          ORDER BY updated_at DESC`,
    );

    const currentTimestamp = new Date().toISOString();
    // Bind 'this' context using bind() or use arrow function
    const changes =
      result?.map((ward) => this.transformWardSyncResponse(ward)) ?? [];

    return {
      changes,
      timestamp: currentTimestamp,
      syncInfo: {
        lastAttemptedSync: lastSyncedAt || null,
        actualSyncFrom: timestampStr,
        recordsFound: changes.length,
        status: status === 'success' ? 'success' : 'partial',
        message: changes.length
          ? SYNC_MESSAGES.SUCCESS(changes.length, timestampStr)
          : SYNC_MESSAGES.NO_CHANGES,
        fallbackReason: status === 'fallback' ? message : null,
      },
    };
  }

  // Convert methods to arrow functions to maintain 'this' context
  private transformWardSyncResponse = (ward: any): WardSyncResponseDto => {
    if (!ward) return null;
    return {
      ...this.transformWardResponse(ward),
      createdAt: ward.createdAt,
      updatedAt: ward.updatedAt,
      deletedAt: ward.deletedAt,
    };
  };

  private transformWardResponse = (ward: any): WardResponseDto => {
    if (!ward) return null;
    return {
      wardNumber: ward.wardNumber,
      wardAreaCode: ward.wardAreaCode,
      geometry:
        typeof ward.geometry === 'string'
          ? JSON.parse(ward.geometry)
          : ward.geometry,
    };
  };
}
