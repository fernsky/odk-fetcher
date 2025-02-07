import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE_ORM } from '../../../core/constants/db.constants';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@app/modules/drizzle/schema';
import { and, eq, sql } from 'drizzle-orm';
import { CreateAreaDto, UpdateAreaDto, AreaQueryDto } from '../dtos/area.dto';
import {
  AreaNotFoundException,
  DuplicateAreaCodeException,
  InvalidGeometryException,
} from '../exceptions/area.exception';
import { nanoid } from 'nanoid';

@Injectable()
export class AreaService {
  constructor(
    @Inject(DRIZZLE_ORM) private db: PostgresJsDatabase<typeof schema>,
  ) {}

  async create(dto: CreateAreaDto) {
    const existingArea = await this.db.query.areas.findFirst({
      where: and(
        eq(schema.areas.code, dto.code),
        eq(schema.areas.wardNumber, dto.wardNumber),
      ),
    });

    if (existingArea) {
      throw new DuplicateAreaCodeException();
    }

    try {
      const geoJson = JSON.stringify(dto.geometry);
      const [area] = await this.db
        .insert(schema.areas)
        .values({
          id: nanoid(),
          code: dto.code,
          wardNumber: dto.wardNumber,
          geometry: sql`ST_GeomFromGeoJSON(${geoJson})`,
          areaStatus: 'unassigned',
        } as unknown as schema.Area)
        .returning();

      return area;
    } catch (error) {
      throw new InvalidGeometryException();
    }
  }

  async findAll(query: AreaQueryDto) {
    const filterConditions = [];

    if (query.wardNumber) {
      filterConditions.push(
        eq(schema.areas.wardNumber, parseInt(query.wardNumber)),
      );
    }
    if (query.status) {
      filterConditions.push(
        eq(schema.areas.areaStatus, query.status as schema.AreaStatus),
      );
    }
    if (query.assignedTo) {
      filterConditions.push(eq(schema.areas.assignedTo, query.assignedTo));
    }

    const areas = await this.db
      .select({
        id: schema.areas.id,
        code: schema.areas.code,
        wardNumber: schema.areas.wardNumber,
        assignedTo: schema.areas.assignedTo,
        areaStatus: schema.areas.areaStatus,
        geometry: sql`ST_AsGeoJSON(${schema.areas.geometry})`,
        centroid: sql`ST_AsGeoJSON(ST_Centroid(${schema.areas.geometry}))`,
      })
      .from(schema.areas)
      .where(filterConditions.length ? and(...filterConditions) : undefined)
      .orderBy(schema.areas.code);

    return areas.map((area) => ({
      ...area,
      geometry:
        typeof area.geometry === 'string'
          ? JSON.parse(area.geometry)
          : area.geometry,
      centroid:
        typeof area.centroid === 'string'
          ? JSON.parse(area.centroid)
          : area.centroid,
    }));
  }

  async findOne(id: string) {
    const area = await this.db.query.areas.findFirst({
      where: eq(schema.areas.id, id),
    });

    if (!area) {
      throw new AreaNotFoundException();
    }

    return area;
  }

  async update(id: string, dto: UpdateAreaDto) {
    await this.findOne(id);

    const updateData: any = {};
    if (dto.code) updateData.code = dto.code;
    if (dto.wardNumber) updateData.wardNumber = dto.wardNumber;
    if (dto.geometry) {
      const geoJson = JSON.stringify(dto.geometry);
      updateData.geometry = sql`ST_GeomFromGeoJSON(${geoJson})`;
    }

    const [updated] = await this.db
      .update(schema.areas)
      .set(updateData)
      .where(eq(schema.areas.id, id))
      .returning({
        id: schema.areas.id,
        code: schema.areas.code,
        wardNumber: schema.areas.wardNumber,
        assignedTo: schema.areas.assignedTo,
        areaStatus: schema.areas.areaStatus,
        geometry: sql`ST_AsGeoJSON(${schema.areas.geometry})`,
      });

    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.db.delete(schema.areas).where(eq(schema.areas.id, id));
    return { success: true };
  }

  async getAvailableCodes(wardNumber: number) {
    const startCode = wardNumber * 1000 + 1;
    const endCode = wardNumber * 1000 + 999;

    const usedCodes = await this.db
      .select({ code: schema.areas.code })
      .from(schema.areas)
      .where(eq(schema.areas.wardNumber, wardNumber));

    const usedCodesSet = new Set(usedCodes.map((a) => a.code));
    return Array.from(
      { length: endCode - startCode + 1 },
      (_, i) => startCode + i,
    ).filter((code) => !usedCodesSet.has(code));
  }
}
