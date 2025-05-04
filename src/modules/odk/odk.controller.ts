import {
  Controller,
  Get,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { OdkService } from './odk.service';

interface FetchSubmissionsDto {
  id: string;
  startDate: string;
  endDate: string;
}

interface FetchStatus {
  status: 'INITIATED' | 'IN_PROGRESS' | 'COMPLETED' | 'ERROR';
  message: string;
  timestamp: Date;
}

@Controller('odk')
export class OdkController {
  private fetchLocks: Map<string, FetchStatus> = new Map();

  constructor(private readonly odkService: OdkService) {}

  @Get('kerabari')
  async getKerabariData() {
    return this.odkService.getKerabariData();
  }

  @Get('buddhashanti')
  async getBuddhashatiData() {
    return this.odkService.getBuddhashatiData();
  }

  @Get('kerabari/fetch-status')
  getFetchStatus(@Query('id') formId: string) {
    return (
      this.fetchLocks.get(formId) || {
        status: 'COMPLETED',
        message: 'No active fetch',
      }
    );
  }

  @Post('kerabari/fetch-submissions')
  async fetchKerabariSubmissions(@Body() input: FetchSubmissionsDto) {
    if (this.fetchLocks.get(input.id)?.status === 'IN_PROGRESS') {
      throw new HttpException(
        'Fetch operation already in progress for this form',
        HttpStatus.CONFLICT,
      );
    }

    this.fetchLocks.set(input.id, {
      status: 'INITIATED',
      message: 'Starting fetch operation',
      timestamp: new Date(),
    });

    this.startKerabariFetch(input);

    return {
      message: 'Fetch operation initiated',
      status: 'INITIATED',
      checkStatusAt: `/odk/kerabari/fetch-status?id=${input.id}`,
    };
  }

  private async startKerabariFetch(input: FetchSubmissionsDto) {
    try {
      this.fetchLocks.set(input.id, {
        status: 'IN_PROGRESS',
        message: 'Fetching submissions',
        timestamp: new Date(),
      });
      console.log('Fetching submissions for Kerabari form:', input.id);
      await this.odkService.fetchKerabariSubmissions(input);

      this.fetchLocks.set(input.id, {
        status: 'COMPLETED',
        message: 'Fetch operation completed successfully',
        timestamp: new Date(),
      });
    } catch (error) {
      this.fetchLocks.set(input.id, {
        status: 'ERROR',
        message: `Error during fetch: ${error}`,
        timestamp: new Date(),
      });
    }
  }

  @Get('buddhashanti/fetch-status')
  getBuddhashantiFetchStatus(@Query('id') formId: string) {
    return (
      this.fetchLocks.get(formId) || {
        status: 'COMPLETED',
        message: 'No active fetch',
      }
    );
  }

  @Post('buddhashanti/fetch-submissions')
  async fetchBuddhashatiSubmissions(@Body() input: FetchSubmissionsDto) {
    if (this.fetchLocks.get(input.id)?.status === 'IN_PROGRESS') {
      throw new HttpException(
        'Fetch operation already in progress for this form',
        HttpStatus.CONFLICT,
      );
    }

    this.fetchLocks.set(input.id, {
      status: 'INITIATED',
      message: 'Starting fetch operation',
      timestamp: new Date(),
    });

    this.startBuddhashantiFetch(input);

    return {
      message: 'Fetch operation initiated',
      status: 'INITIATED',
      checkStatusAt: `/odk/buddhashanti/fetch-status?id=${input.id}`,
    };
  }

  private async startBuddhashantiFetch(input: FetchSubmissionsDto) {
    try {
      this.fetchLocks.set(input.id, {
        status: 'IN_PROGRESS',
        message: 'Fetching submissions',
        timestamp: new Date(),
      });

      await this.odkService.fetchBuddhashatiSubmissions(input);

      this.fetchLocks.set(input.id, {
        status: 'COMPLETED',
        message: 'Fetch operation completed successfully',
        timestamp: new Date(),
      });
    } catch (error) {
      this.fetchLocks.set(input.id, {
        status: 'ERROR',
        message: `Error during fetch: ${error}`,
        timestamp: new Date(),
      });
    }
  }

  @Get('gadhawa')
  async getGadhawaData() {
    return this.odkService.getGadhawaData();
  }

  @Get('gadhawa/fetch-status')
  getGadhawaFetchStatus(@Query('id') formId: string) {
    return (
      this.fetchLocks.get(formId) || {
        status: 'COMPLETED',
        message: 'No active fetch',
      }
    );
  }

  @Post('gadhawa/fetch-submissions')
  async fetchGadhawaSubmissions(@Body() input: FetchSubmissionsDto) {
    if (this.fetchLocks.get(input.id)?.status === 'IN_PROGRESS') {
      throw new HttpException(
        'Fetch operation already in progress for this form',
        HttpStatus.CONFLICT,
      );
    }

    this.fetchLocks.set(input.id, {
      status: 'INITIATED',
      message: 'Starting fetch operation',
      timestamp: new Date(),
    });

    this.startGadhawaFetch(input);

    return {
      message: 'Fetch operation initiated',
      status: 'INITIATED',
      checkStatusAt: `/odk/gadhawa/fetch-status?id=${input.id}`,
    };
  }

  private async startGadhawaFetch(input: FetchSubmissionsDto) {
    try {
      this.fetchLocks.set(input.id, {
        status: 'IN_PROGRESS',
        message: 'Fetching submissions',
        timestamp: new Date(),
      });

      await this.odkService.fetchGadhawaSubmissions(input);

      this.fetchLocks.set(input.id, {
        status: 'COMPLETED',
        message: 'Fetch operation completed successfully',
        timestamp: new Date(),
      });
    } catch (error) {
      this.fetchLocks.set(input.id, {
        status: 'ERROR',
        message: `Error during fetch: ${error}`,
        timestamp: new Date(),
      });
    }
  }

  @Get('lungri')
  async getLungriData() {
    return this.odkService.getLungriData();
  }

  @Get('lungri/fetch-status')
  getLungriFetchStatus(@Query('id') formId: string) {
    return (
      this.fetchLocks.get(formId) || {
        status: 'COMPLETED',
        message: 'No active fetch',
      }
    );
  }

  @Post('lungri/fetch-submissions')
  async fetchLungriSubmissions(@Body() input: FetchSubmissionsDto) {
    if (this.fetchLocks.get(input.id)?.status === 'IN_PROGRESS') {
      throw new HttpException(
        'Fetch operation already in progress for this form',
        HttpStatus.CONFLICT,
      );
    }

    this.fetchLocks.set(input.id, {
      status: 'INITIATED',
      message: 'Starting fetch operation',
      timestamp: new Date(),
    });

    this.startLungriFetch(input);

    return {
      message: 'Fetch operation initiated',
      status: 'INITIATED',
      checkStatusAt: `/odk/lungri/fetch-status?id=${input.id}`,
    };
  }

  private async startLungriFetch(input: FetchSubmissionsDto) {
    try {
      this.fetchLocks.set(input.id, {
        status: 'IN_PROGRESS',
        message: 'Fetching submissions',
        timestamp: new Date(),
      });

      await this.odkService.fetchLungriSubmissions(input);

      this.fetchLocks.set(input.id, {
        status: 'COMPLETED',
        message: 'Fetch operation completed successfully',
        timestamp: new Date(),
      });
    } catch (error) {
      this.fetchLocks.set(input.id, {
        status: 'ERROR',
        message: `Error during fetch: ${error}`,
        timestamp: new Date(),
      });
    }
  }
}
