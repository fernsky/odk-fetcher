import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { WardService } from './ward.service';
import {
  CreateWardDto,
  UpdateWardDto,
  WardResponseDto,
  SyncResponseDto,
  SyncQueryDto,
} from './dto/ward.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enum/roles.enum';

@ApiTags('wards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('wards')
export class WardController {
  constructor(private readonly wardService: WardService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new ward' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: WardResponseDto,
    description: 'Ward has been successfully created.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid ward data or ward number already exists.',
  })
  create(@Body() createWardDto: CreateWardDto): Promise<WardResponseDto> {
    return this.wardService.create(createWardDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all wards' })
  @ApiResponse({
    status: 200,
    type: [WardResponseDto],
    description: 'List of all wards',
  })
  findAll(): Promise<WardResponseDto[]> {
    return this.wardService.findAll();
  }

  @Get('sync')
  @ApiOperation({ summary: 'Get ward changes for sync' })
  @ApiQuery({
    name: 'lastSyncedAt',
    required: false,
    type: String,
    description:
      'ISO 8601 timestamp of last sync (e.g., 2024-02-01T10:00:00.000Z)',
  })
  @ApiResponse({
    status: 200,
    type: SyncResponseDto,
    description: 'Ward changes and sync timestamp',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid date format. Expected ISO 8601 timestamp.',
  })
  getChanges(
    @Query(
      new ValidationPipe({
        transform: true,
        validateCustomDecorators: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    syncQuery: SyncQueryDto,
  ): Promise<SyncResponseDto> {
    return this.wardService.getChanges(syncQuery.lastSyncedAt);
  }

  @Get(':wardNumber')
  @ApiOperation({ summary: 'Get a ward by number' })
  @ApiParam({ name: 'wardNumber', type: Number })
  @ApiResponse({ status: 200, type: WardResponseDto })
  @ApiResponse({ status: 404, description: 'Ward not found' })
  findOne(
    @Param('wardNumber', ParseIntPipe) wardNumber: number,
  ): Promise<WardResponseDto> {
    return this.wardService.findOne(wardNumber);
  }

  @Patch(':wardNumber')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a ward' })
  @ApiParam({ name: 'wardNumber', type: Number })
  @ApiResponse({ status: 200, type: WardResponseDto })
  @ApiResponse({ status: 404, description: 'Ward not found' })
  update(
    @Param('wardNumber', ParseIntPipe) wardNumber: number,
    @Body() updateWardDto: UpdateWardDto,
  ): Promise<WardResponseDto> {
    return this.wardService.update(wardNumber, updateWardDto);
  }

  @Delete(':wardNumber')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a ward' })
  @ApiParam({ name: 'wardNumber', type: Number })
  @ApiResponse({ status: 200, description: 'Ward deleted successfully' })
  @ApiResponse({ status: 404, description: 'Ward not found' })
  remove(@Param('wardNumber', ParseIntPipe) wardNumber: number): Promise<void> {
    return this.wardService.remove(wardNumber);
  }
}
