import { Injectable, Logger } from '@nestjs/common';
import { BuildingAggregateRepository } from '../interfaces/repository.interface';
import {
  KerabariAggregateBuilding,
  NewKerabariAggregateBuilding,
} from '../model/kerabari-aggregate-buildings';
import { kerabariDb } from '../../../modules/drizzle/kerabari-db';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { jsonToPostgres } from '@app/common/utils/data';

@Injectable()
export class BuildingAggregateRepositoryImpl
  implements BuildingAggregateRepository
{
  private readonly logger = new Logger(BuildingAggregateRepositoryImpl.name);

  async saveAggregateBuilding(
    buildingData: any | NewKerabariAggregateBuilding,
  ): Promise<void> {
    try {
      this.logger.debug(
        `Saving aggregate building with ID: ${buildingData.id}`,
      );

      // Format dates to avoid timezone issues
      const payload = { ...buildingData };

      // Ensure dates are properly formatted for PostgreSQL
      if (payload.building_survey_date) {
        payload.building_survey_date = this.formatDateForDB(
          payload.building_survey_date,
        );
      }

      if (payload.building_submission_date) {
        payload.building_submission_date = this.formatDateForDB(
          payload.building_submission_date,
        );
      }

      // Always set created_at and updated_at
      payload.created_at = new Date().toISOString().split('.')[0];
      payload.updated_at = new Date().toISOString().split('.')[0];

      // Use jsonToPostgres to generate the SQL statement
      const statement = jsonToPostgres('kerabari_aggregate_buildings', payload);

      if (statement) {
        this.logger.debug('Executing SQL insert statement');
        // Execute the generated SQL statement
        await kerabariDb.execute(sql.raw(statement));
        this.logger.log(
          `Successfully inserted aggregate building with ID: ${buildingData.id}`,
        );
      } else {
        this.logger.warn(
          'No SQL statement generated for aggregate building insert',
        );
        throw new Error('Failed to generate SQL statement for building insert');
      }
    } catch (error) {
      this.logger.error(
        `Error saving aggregate building with ID ${buildingData.id}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async findByBuildingToken(buildingToken: string): Promise<any | null> {
    try {
      this.logger.debug(
        `Finding aggregate building by token: ${buildingToken}`,
      );
      const results = await kerabariDb
        .select()
        .from(KerabariAggregateBuilding)
        .where(eq(KerabariAggregateBuilding.building_token, buildingToken))
        .limit(1);

      if (results.length > 0) {
        this.logger.debug(
          `Found aggregate building with token: ${buildingToken}`,
        );
        return results[0];
      } else {
        this.logger.debug(
          `No aggregate building found with token: ${buildingToken}`,
        );
        return null;
      }
    } catch (error) {
      this.logger.error(
        `Error finding aggregate building by token ${buildingToken}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async findById(id: string): Promise<KerabariAggregateBuilding | null> {
    try {
      this.logger.debug(`Finding aggregate building by ID: ${id}`);
      const results = await kerabariDb
        .select()
        .from(KerabariAggregateBuilding)
        .where(eq(KerabariAggregateBuilding.id, id))
        .limit(1);

      if (results.length > 0) {
        this.logger.debug(`Found aggregate building with ID: ${id}`);
        return results[0];
      } else {
        this.logger.debug(`No aggregate building found with ID: ${id}`);
        return null;
      }
    } catch (error) {
      this.logger.error(
        `Error finding aggregate building by ID ${id}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async updateAggregateBuilding(
    id: string,
    data: Partial<KerabariAggregateBuilding>,
  ): Promise<void> {
    try {
      this.logger.debug(`Updating aggregate building with ID: ${id}`);

      // Clone data to avoid modifying the input
      const payload = { ...data };

      // Make sure we have the ID in the payload for the WHERE clause
      payload.id = id;

      // Generate SQL update statement using jsonToPostgres with the proper CONFLICT option
      const statement = jsonToPostgres(
        'kerabari_aggregate_buildings',
        payload,
        `ON CONFLICT(id) DO UPDATE SET`, // Specify the conflict resolution
      );

      if (statement) {
        this.logger.debug('Executing SQL update statement');
        // Execute the generated SQL statement
        await kerabariDb.execute(sql.raw(statement));
        this.logger.log(
          `Successfully updated aggregate building with ID: ${id}`,
        );
      } else {
        this.logger.warn(
          'No SQL statement generated for aggregate building update',
        );
        throw new Error('Failed to generate SQL statement for building update');
      }
    } catch (error) {
      this.logger.error(
        `Error updating aggregate building with ID ${id}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Format a date for PostgreSQL to avoid timezone issues
   */
  private formatDateForDB(date: string | Date): string {
    if (!date) return null;

    try {
      // If it's already an ISO string, extract the date part without the time zone
      if (typeof date === 'string') {
        // Remove any timezone info to avoid issues
        return date.split('.')[0].split('T').join(' ');
      }

      // If it's a Date object, convert to ISO and extract the date part
      return date.toISOString().split('.')[0].split('T').join(' ');
    } catch (error) {
      this.logger.warn(`Error formatting date: ${date}`, error);
      // Return as is if there's an error
      return date as any;
    }
  }
}
