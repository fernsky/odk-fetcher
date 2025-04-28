import { Injectable } from '@nestjs/common';
import { BuildingAggregateRepository } from '../interfaces/repository.interface';
import {
  buddhashantiAggregateBuilding,
  BuddhashantiAggregateBuilding,
} from '../model/buddhashanti-aggregate-buildings';
import { buddhashantiDb } from '../../../modules/drizzle/buddhashanti-db';
import { eq } from 'drizzle-orm';

@Injectable()
export class BuildingAggregateRepositoryImpl
  implements BuildingAggregateRepository
{
  async saveAggregateBuilding(
    buildingData: BuddhashantiAggregateBuilding,
  ): Promise<void> {
    // Instead of manually mapping the fields, let TypeScript infer the expected structure
    // from the table definition to ensure type safety
    await buddhashantiDb.insert(buddhashantiAggregateBuilding).values({
      id: buildingData.id,
      // Use the column accessor syntax to ensure we're referencing valid columns
      [buddhashantiAggregateBuilding.buildingId.name]: buildingData.buildingId,
      [buddhashantiAggregateBuilding.buildingToken.name]:
        buildingData.buildingToken ?? null,
      [buddhashantiAggregateBuilding.wardNumber.name]: buildingData.wardNumber,
      [buddhashantiAggregateBuilding.areaCode.name]: buildingData.areaCode,
      [buddhashantiAggregateBuilding.locality.name]: buildingData.locality,
      [buddhashantiAggregateBuilding.totalFamilies.name]:
        buildingData.totalFamilies,
      [buddhashantiAggregateBuilding.totalBusinesses.name]:
        buildingData.totalBusinesses,
      [buddhashantiAggregateBuilding.buildingSurveyDate.name]:
        buildingData.buildingSurveyDate,
      [buddhashantiAggregateBuilding.buildingSubmissionDate.name]:
        buildingData.buildingSubmissionDate,
      [buddhashantiAggregateBuilding.enumeratorId.name]:
        buildingData.enumeratorId,
      [buddhashantiAggregateBuilding.enumeratorName.name]:
        buildingData.enumeratorName,
      [buddhashantiAggregateBuilding.enumeratorPhone.name]:
        buildingData.enumeratorPhone,
      [buddhashantiAggregateBuilding.buildingOwnerName.name]:
        buildingData.buildingOwnerName,
      [buddhashantiAggregateBuilding.buildingOwnerPhone.name]:
        buildingData.buildingOwnerPhone,
      [buddhashantiAggregateBuilding.buildingGpsLatitude.name]:
        buildingData.buildingGpsLatitude,
      [buddhashantiAggregateBuilding.buildingGpsLongitude.name]:
        buildingData.buildingGpsLongitude,
      [buddhashantiAggregateBuilding.buildingGpsAltitude.name]:
        buildingData.buildingGpsAltitude,
      [buddhashantiAggregateBuilding.buildingGpsAccuracy.name]:
        buildingData.buildingGpsAccuracy,
      [buddhashantiAggregateBuilding.buildingOwnershipStatus.name]:
        buildingData.buildingOwnershipStatus,
      [buddhashantiAggregateBuilding.buildingOwnershipStatusOther.name]:
        buildingData.buildingOwnershipStatusOther,
      [buddhashantiAggregateBuilding.buildingBase.name]:
        buildingData.buildingBase,
      [buddhashantiAggregateBuilding.buildingBaseOther.name]:
        buildingData.buildingBaseOther,
      [buddhashantiAggregateBuilding.buildingOuterWall.name]:
        buildingData.buildingOuterWall,
      [buddhashantiAggregateBuilding.buildingOuterWallOther.name]:
        buildingData.buildingOuterWallOther,
      [buddhashantiAggregateBuilding.buildingRoof.name]:
        buildingData.buildingRoof,
      [buddhashantiAggregateBuilding.buildingRoofOther.name]:
        buildingData.buildingRoofOther,
      [buddhashantiAggregateBuilding.naturalDisasters.name]:
        buildingData.naturalDisasters,
      [buddhashantiAggregateBuilding.naturalDisastersOther.name]:
        buildingData.naturalDisastersOther,
      [buddhashantiAggregateBuilding.buildingImageKey.name]:
        buildingData.buildingImageKey,
      [buddhashantiAggregateBuilding.buildingEnumeratorSelfieKey.name]:
        buildingData.buildingEnumeratorSelfieKey,
      [buddhashantiAggregateBuilding.buildingAudioRecordingKey.name]:
        buildingData.buildingAudioRecordingKey,
      [buddhashantiAggregateBuilding.households.name]: buildingData.households,
      [buddhashantiAggregateBuilding.businesses.name]: buildingData.businesses,
      [buddhashantiAggregateBuilding.createdAt.name]: new Date(),
      [buddhashantiAggregateBuilding.updatedAt.name]: new Date(),
    });
  }

  async findByBuildingToken(buildingToken: string): Promise<any | null> {
    const results = await buddhashantiDb
      .select()
      .from(buddhashantiAggregateBuilding)
      .where(eq(buddhashantiAggregateBuilding.buildingToken, buildingToken))
      .limit(1);

    return results.length > 0 ? results[0] : null;
  }

  async updateAggregateBuilding(
    id: string,
    data: Partial<BuddhashantiAggregateBuilding>,
  ): Promise<void> {
    // Convert from camelCase model properties to snake_case database columns in a type-safe way
    const updates: Record<string, any> = {};

    // Only set properties that are defined in the input data
    Object.keys(data).forEach((key) => {
      const camelCaseKey = key as keyof BuddhashantiAggregateBuilding;
      if (
        data[camelCaseKey] !== undefined &&
        buddhashantiAggregateBuilding[camelCaseKey]
      ) {
        updates[buddhashantiAggregateBuilding[camelCaseKey].name] =
          data[camelCaseKey];
      }
    });

    await buddhashantiDb
      .update(buddhashantiAggregateBuilding)
      .set({
        ...updates,
        [buddhashantiAggregateBuilding.updatedAt.name]: new Date(),
      })
      .where(eq(buddhashantiAggregateBuilding.id, id));
  }
}
