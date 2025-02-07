import {
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GeometryDto {
  @ApiProperty({ example: 'Polygon' })
  @IsString()
  type: string;

  @ApiProperty({
    example: [
      [
        [1, 1],
        [2, 2],
        [3, 3],
        [1, 1],
      ],
    ],
  })
  @IsObject()
  coordinates: number[][][];
}

export class CreateAreaDto {
  @ApiProperty({ example: 1001 })
  @IsInt()
  @IsNotEmpty()
  code: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  wardNumber: number;

  @ApiProperty()
  @IsObject()
  @IsNotEmpty()
  geometry: GeometryDto;
}

export class UpdateAreaDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  code?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  wardNumber?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  geometry?: GeometryDto;
}

export class AreaQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  wardNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  assignedTo?: string;
}
