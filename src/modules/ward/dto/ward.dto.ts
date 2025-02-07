import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  Min,
  IsObject,
  ValidateNested,
  IsISO8601,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Transform } from 'class-transformer';
import type { Polygon } from 'geojson';

export class GeometryDto implements Polygon {
  @ApiProperty({ enum: ['Polygon'] })
  @IsNotEmpty()
  type: 'Polygon';

  @ApiProperty({ type: Array })
  @IsNotEmpty()
  coordinates: number[][][];
}

export class CreateWardDto {
  @ApiProperty({
    description: 'Ward number',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  wardNumber: number;

  @ApiProperty({
    description: 'Ward area code',
    example: 101,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  wardAreaCode: number;

  @ApiProperty({
    description: 'Ward geometry in GeoJSON Polygon format',
    required: false,
    type: GeometryDto,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => GeometryDto)
  geometry?: GeometryDto;
}

export class UpdateWardDto {
  @ApiProperty({
    description: 'Ward area code',
    example: 101,
    minimum: 1,
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  wardAreaCode?: number;

  @ApiProperty({
    description: 'Ward geometry in GeoJSON Polygon format',
    required: false,
  })
  @IsOptional()
  geometry?: Polygon;
}

export class WardResponseDto {
  @ApiProperty({ example: 1 })
  wardNumber: number;

  @ApiProperty({ example: 101 })
  wardAreaCode: number;

  @ApiProperty({
    description: 'GeoJSON Polygon representation of ward boundaries',
    required: false,
  })
  geometry?: Polygon;
}

export class SyncQueryDto {
  @ApiProperty({
    description: 'Last sync timestamp (ISO 8601 format)',
    example: '2024-02-01T10:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsISO8601({ strict: false })
  @Transform(({ value }) => {
    // Handle empty or undefined values
    if (!value) return undefined;
    // Try to parse the date string
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : value;
  })
  lastSyncedAt?: string;
}

export class WardSyncResponseDto extends WardResponseDto {
  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  deletedAt?: Date;
}

export class SyncInfo {
  @ApiProperty({ description: 'The sync timestamp that was attempted' })
  lastAttemptedSync: string | null;

  @ApiProperty({ description: 'The actual timestamp used for sync' })
  actualSyncFrom: string;

  @ApiProperty({ description: 'Number of records found' })
  recordsFound: number;

  @ApiProperty({ enum: ['success', 'partial', 'error'] })
  status: 'success' | 'partial' | 'error';

  @ApiProperty({ description: 'Information about the sync operation' })
  message: string;

  @ApiProperty({
    description: 'Reason for fallback if sync parameters were adjusted',
    required: false,
  })
  fallbackReason?: string | null;
}

export class SyncResponseDto {
  @ApiProperty({ type: [WardSyncResponseDto] })
  changes: WardSyncResponseDto[];

  @ApiProperty()
  timestamp: string;

  @ApiProperty({ type: SyncInfo })
  syncInfo: SyncInfo;
}
