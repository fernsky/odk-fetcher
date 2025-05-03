import {
  Controller,
  Post,
  Get,
  Param,
  Delete,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { BuildingAggregateService } from '../services/building.aggregate.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Building Aggregation')
@Controller('kerabari-survey')
export class AggregationController {
  constructor(
    private readonly buildingAggregateService: BuildingAggregateService,
  ) {}

  @Post('aggregate-buildings')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start the building aggregation process' })
  @ApiResponse({ status: 201, description: 'The aggregation job has started.' })
  @ApiResponse({
    status: 409,
    description: 'Another aggregation job is already in progress.',
  })
  async startAggregation() {
    try {
      const result = await this.buildingAggregateService.startAggregation();
      return {
        status: 'success',
        message: 'Building aggregation job started',
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          status: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Failed to start aggregation',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('aggregate-buildings/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get status of the current aggregation job' })
  @ApiResponse({ status: 200, description: 'Returns the current job status' })
  async getAggregationStatus() {
    try {
      const job = await this.buildingAggregateService.getAggregationStatus();

      if (!job) {
        return {
          status: 'success',
          message: 'No active aggregation job found',
          data: null,
        };
      }

      return {
        status: 'success',
        message: 'Current aggregation job status',
        data: job,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Failed to get aggregation status',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('aggregate-buildings/:jobId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Stop an in-progress aggregation job' })
  @ApiResponse({
    status: 200,
    description: 'The aggregation job has been stopped',
  })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async stopAggregation(@Param('jobId') jobId: string) {
    try {
      const result = await this.buildingAggregateService.stopAggregation(jobId);

      if (!result) {
        throw new HttpException(
          'Job not found or already completed',
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        status: 'success',
        message: 'Aggregation job stopped successfully',
        data: { jobId },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          status: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Failed to stop aggregation job',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
