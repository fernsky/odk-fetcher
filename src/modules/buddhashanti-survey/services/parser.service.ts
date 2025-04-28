import { Injectable, Logger } from '@nestjs/common';
import { ParserService } from '../interfaces/service.interface';
import {
  HouseholdData,
  BusinessData,
} from '../model/buddhashanti-aggregate-buildings';
import stringSimilarity from 'string-similarity';

@Injectable()
export class ParserServiceImpl implements ParserService {
  private readonly logger = new Logger(ParserServiceImpl.name);

  async parseBuilding(buildingData: Record<string, any>): Promise<any> {
    try {
      const formData = buildingData.data;

      // Extract building information from the form data
      return {
        buildingToken: formData.building_token || '',
        wardNumber: parseInt(formData.ward_number, 10) || null,
        areaCode: parseInt(formData.area_code, 10) || null,
        locality: formData.locality || '',
        buildingSurveyDate: formData.survey_date
          ? new Date(formData.survey_date)
          : null,
        buildingSubmissionDate: buildingData.created_at,
        enumeratorId: formData.enumerator_id || '',
        enumeratorName: formData.enumerator_name || '',
        enumeratorPhone: formData.enumerator_phone || '',
        buildingOwnerName: formData.building_owner_name || '',
        buildingOwnerPhone: formData.building_owner_phone || '',
        buildingGpsLatitude: parseFloat(formData.gps?.latitude) || null,
        buildingGpsLongitude: parseFloat(formData.gps?.longitude) || null,
        buildingGpsAltitude: parseFloat(formData.gps?.altitude) || null,
        buildingGpsAccuracy: parseFloat(formData.gps?.accuracy) || null,
        buildingOwnershipStatus: formData.building_ownership_status || '',
        buildingOwnershipStatusOther:
          formData.building_ownership_status_other || '',
        buildingBase: formData.building_base || '',
        buildingBaseOther: formData.building_base_other || '',
        buildingOuterWall: formData.building_outer_wall || '',
        buildingOuterWallOther: formData.building_outer_wall_other || '',
        buildingRoof: formData.building_roof || '',
        buildingRoofOther: formData.building_roof_other || '',
        naturalDisasters: formData.natural_disasters || [],
        naturalDisastersOther: formData.natural_disasters_other || '',
        buildingImageKey: formData.building_image || '',
        buildingEnumeratorSelfieKey: formData.enumerator_selfie || '',
        buildingAudioRecordingKey: formData.audio_recording || '',
      };
    } catch (error) {
      this.logger.error(
        `Error parsing building data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new Error(
        `Error parsing building: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async parseHousehold(
    householdData: Record<string, any>,
  ): Promise<HouseholdData> {
    try {
      const formData = householdData.data;

      return {
        household_survey_date: formData.survey_date || null,
        household_submission_date: householdData.created_at || null,
        household_gps_latitude: parseFloat(formData.gps?.latitude) || null,
        household_gps_longitude: parseFloat(formData.gps?.longitude) || null,
        household_gps_altitude: parseFloat(formData.gps?.altitude) || null,
        household_gps_accuracy: parseFloat(formData.gps?.accuracy) || null,
        household_locality: formData.locality || '',
        household_development_organization:
          formData.development_organization || '',
        household_image_key: formData.household_image || '',
        household_enumerator_selfie_key: formData.enumerator_selfie || '',
        household_audio_recording_key: formData.audio_recording || '',
      };
    } catch (error) {
      this.logger.error(
        `Error parsing household data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new Error(
        `Error parsing household: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  async parseBusiness(
    businessData: Record<string, any>,
  ): Promise<BusinessData> {
    try {
      const formData = businessData.data;

      return {
        business_survey_date: formData.survey_date || null,
        business_submission_date: businessData.created_at || null,
        business_gps_latitude: parseFloat(formData.gps?.latitude) || null,
        business_gps_longitude: parseFloat(formData.gps?.longitude) || null,
        business_gps_altitude: parseFloat(formData.gps?.altitude) || null,
        business_gps_accuracy: parseFloat(formData.gps?.accuracy) || null,
        business_locality: formData.locality || '',
        business_image_key: formData.business_image || '',
        business_enumerator_selfie_key: formData.enumerator_selfie || '',
        business_audio_recording_key: formData.audio_recording || '',
      };
    } catch (error) {
      this.logger.error(
        `Error parsing business data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new Error(
        `Error parsing business: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  calculateSimilarityScore(token1: string, token2: string): number {
    if (!token1 || !token2) return 0;

    // Use string-similarity library to calculate similarity
    return stringSimilarity.compareTwoStrings(
      token1.toLowerCase(),
      token2.toLowerCase(),
    );
  }
}
