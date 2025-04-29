import { Injectable, Logger } from '@nestjs/common';
import { BuildingAggregateRepository } from '../interfaces/repository.interface';
import {
  buddhashantiAggregateBuilding,
  BuddhashantiAggregateBuilding,
  NewBuddhashantiAggregateBuilding,
} from '../model/buddhashanti-aggregate-buildings';
import { buddhashantiDb } from '../../../modules/drizzle/buddhashanti-db';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { jsonToPostgres } from '@app/common/utils/data';

@Injectable()
export class BuildingAggregateRepositoryImpl
  implements BuildingAggregateRepository
{
  private readonly logger = new Logger(BuildingAggregateRepositoryImpl.name);

  async saveAggregateBuilding(
    buildingData: any | NewBuddhashantiAggregateBuilding,
  ): Promise<void> {
    try {
      this.logger.debug(
        `Saving aggregate building with ID: ${buildingData.id}`,
      );

      // Format the buildingData for insertion
      const payload = {
        id: buildingData.id,
        building_id: buildingData.buildingId,
        building_token: buildingData.buildingToken || null,
        ward_number: buildingData.wardNumber,
        area_code: buildingData.areaCode,
        locality: buildingData.locality,
        building_survey_date: buildingData.buildingSurveyDate
          ? new Date(buildingData.buildingSurveyDate).toISOString()
          : null,
        building_submission_date: buildingData.buildingSubmissionDate
          ? new Date(buildingData.buildingSubmissionDate).toISOString()
          : null,
        enumerator_id: buildingData.enumeratorId,
        enumerator_name: buildingData.enumeratorName,
        enumerator_phone: buildingData.enumeratorPhone,
        building_owner_name: buildingData.buildingOwnerName,
        building_owner_phone: buildingData.buildingOwnerPhone,
        total_families: buildingData.totalFamilies || 0,
        total_businesses: buildingData.totalBusinesses || 0,
        building_gps_latitude: buildingData.buildingGpsLatitude,
        building_gps_longitude: buildingData.buildingGpsLongitude,
        building_gps_altitude: buildingData.buildingGpsAltitude,
        building_gps_accuracy: buildingData.buildingGpsAccuracy,
        building_ownership_status: buildingData.buildingOwnershipStatus,
        building_ownership_status_other:
          buildingData.buildingOwnershipStatusOther,
        building_base: buildingData.buildingBase,
        building_base_other: buildingData.buildingBaseOther,
        building_outer_wall: buildingData.buildingOuterWall,
        building_outer_wall_other: buildingData.buildingOuterWallOther,
        building_roof: buildingData.buildingRoof,
        building_roof_other: buildingData.buildingRoofOther,
        natural_disasters: buildingData.naturalDisasters,
        natural_disasters_other: buildingData.naturalDisastersOther,
        building_image_key: buildingData.buildingImageKey,
        building_enumerator_selfie_key:
          buildingData.buildingEnumeratorSelfieKey,
        building_audio_recording_key: buildingData.buildingAudioRecordingKey,
        households: buildingData.households || [],
        businesses: buildingData.businesses || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.logger.debug(payload);

      // Use jsonToPostgres to generate the SQL statement
      const statement = jsonToPostgres(
        'buddhashanti_aggregate_buildings',
        payload,
      );

      if (statement) {
        this.logger.debug('Executing SQL insert statement');
        // Execute the generated SQL statement
        await buddhashantiDb.execute(sql.raw(statement));
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
      const results = await buddhashantiDb
        .select()
        .from(buddhashantiAggregateBuilding)
        .where(eq(buddhashantiAggregateBuilding.buildingToken, buildingToken))
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

  async findById(id: string): Promise<BuddhashantiAggregateBuilding | null> {
    try {
      this.logger.debug(`Finding aggregate building by ID: ${id}`);
      const results = await buddhashantiDb
        .select()
        .from(buddhashantiAggregateBuilding)
        .where(eq(buddhashantiAggregateBuilding.id, id))
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
    data: Partial<BuddhashantiAggregateBuilding>,
  ): Promise<void> {
    try {
      this.logger.debug(`Updating aggregate building with ID: ${id}`);
      const statement = jsonToPostgres(
        'buddhashanti_aggregate_buildings',
        data,
      );

      if (statement) {
        this.logger.debug('Executing SQL update statement');
        this.logger.debug(statement);
        // Execute the generated SQL statement
        await buddhashantiDb.execute(sql.raw(statement));
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
}
