import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AreaService } from '../services/area.service';
import { CreateAreaDto, UpdateAreaDto, AreaQueryDto } from '../dtos/area.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Role } from '../../auth/enum/roles.enum';

@ApiTags('Areas')
@ApiBearerAuth()
@Controller('areas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AreaController {
  constructor(private readonly areaService: AreaService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  @ApiOperation({ summary: 'Create a new area' })
  @ApiResponse({ status: 201, description: 'Area created successfully' })
  create(@Body() createAreaDto: CreateAreaDto) {
    return this.areaService.create(createAreaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all areas with optional filters' })
  @ApiResponse({ status: 200, description: 'Returns list of areas' })
  findAll(@Query() query: AreaQueryDto) {
    return this.areaService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get area by ID' })
  @ApiResponse({ status: 200, description: 'Returns a single area' })
  findOne(@Param('id') id: string) {
    return this.areaService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  @ApiOperation({ summary: 'Update an area' })
  @ApiResponse({ status: 200, description: 'Area updated successfully' })
  update(@Param('id') id: string, @Body() updateAreaDto: UpdateAreaDto) {
    return this.areaService.update(id, updateAreaDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete an area' })
  @ApiResponse({ status: 200, description: 'Area deleted successfully' })
  remove(@Param('id') id: string) {
    return this.areaService.remove(id);
  }

  @Get('ward/:wardNumber/available-codes')
  @ApiOperation({ summary: 'Get available area codes for a ward' })
  @ApiResponse({ status: 200, description: 'Returns list of available codes' })
  getAvailableCodes(@Param('wardNumber') wardNumber: number) {
    return this.areaService.getAvailableCodes(wardNumber);
  }
}
