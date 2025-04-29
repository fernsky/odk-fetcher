import { Injectable } from '@nestjs/common';
import { SurveyData } from '@app/modules/drizzle/buddhashanti-db/schema';
import { RawBuildingData } from '../../../odk/buddhashanti-services/parser/parse-buildings';
import { BaseParserService } from './base-parser.service';

@Injectable()
export class BuildingParserService extends BaseParserService {
  constructor() {
    super(BuildingParserService.name);
  }

  async parseBuilding(
    buildingData: Record<string, any> | SurveyData<RawBuildingData>,
  ): Promise<any> {
    try {
      // Handle data whether it comes directly or wrapped in SurveyData
      const actualBuildingData = this.extractDataFromSurvey(buildingData);

      this.logger.log(
        `Starting to parse building data with ID: ${actualBuildingData.__id || 'unknown'}`,
      );

      // Handle building data in the format from the sample data
      const formData = actualBuildingData;

      // Process location data
      let gpsData = {
        latitude: null,
        longitude: null,
        altitude: null,
        accuracy: null,
      };

      this.logger.log('Processing GPS data from tmp_location field');
      if (formData.tmp_location) {
        if (typeof formData.tmp_location === 'string') {
          // Parse the POINT string format
          this.logger.debug(
            'Parsing GPS data from string format:',
            formData.tmp_location,
          );
          const coords = formData.tmp_location
            .replace('POINT (', '')
            .replace(')', '')
            .split(' ');
          gpsData = {
            latitude: parseFloat(coords[1]) || null,
            longitude: parseFloat(coords[0]) || null,
            altitude: parseFloat(coords[2]) || null,
            accuracy: 0, // Default accuracy if not provided
          };
          this.logger.debug('Parsed GPS coordinates:', gpsData);
        } else if (formData.tmp_location.type === 'Point') {
          // Handle GeoJSON format
          this.logger.debug(
            'Parsing GPS data from GeoJSON format:',
            formData.tmp_location,
          );
          const coords = formData.tmp_location.coordinates;
          gpsData = {
            latitude: coords[1] || null,
            longitude: coords[0] || null,
            altitude: coords[2] || null,
            accuracy: formData.tmp_location.properties?.accuracy || 0,
          };
          this.logger.debug('Parsed GPS coordinates:', gpsData);
        } else {
          this.logger.warn(
            'Unrecognized GPS data format:',
            formData.tmp_location,
          );
        }
      } else {
        this.logger.warn('No GPS data found in tmp_location field');
      }

      // Extract natural disasters as array
      let naturalDisastersArray = [];
      this.logger.log('Processing natural disasters field');
      if (formData.natural_disasters) {
        this.logger.debug(
          'Natural disasters raw value:',
          formData.natural_disasters,
        );
        naturalDisastersArray = formData.natural_disasters.split(' ');
        this.logger.debug(
          'Parsed natural disasters array:',
          naturalDisastersArray,
        );
      } else {
        this.logger.debug('No natural disasters data found');
      }

      // Extract building information from the form data
      this.logger.log('Constructing building object from form data');

      const wardNumber =
        parseInt(formData.ward_no || formData.ward_number, 10) || null;
      this.logger.debug(
        `Ward number parsed: ${wardNumber} from source: ${formData.ward_no || formData.ward_number}`,
      );

      const areaCode = parseInt(formData.area_code, 10) || null;
      this.logger.debug(
        `Area code parsed: ${areaCode} from source: ${formData.area_code}`,
      );

      const buildingSurveyDate = formData.survey_date
        ? new Date(formData.survey_date)
        : null;
      this.logger.debug(
        `Survey date parsed: ${buildingSurveyDate} from source: ${formData.survey_date}`,
      );

      const buildingSubmissionDate = formData.__system?.submissionDate
        ? new Date(formData.__system.submissionDate)
        : null;
      this.logger.debug(`Submission date parsed: ${buildingSubmissionDate}`);

      const totalFamilies = parseInt(formData.total_families, 10) || 0;
      this.logger.debug(
        `Total families parsed: ${totalFamilies} from source: ${formData.total_families}`,
      );

      const totalBusinesses = parseInt(formData.total_businesses, 10) || 0;
      this.logger.debug(
        `Total businesses parsed: ${totalBusinesses} from source: ${formData.total_businesses}`,
      );

      const result = {
        buildingToken: formData.building_token || '',
        wardNumber,
        areaCode,
        locality: formData.locality || '',
        buildingSurveyDate,
        buildingSubmissionDate,
        enumeratorId: formData.enumerator_id || '',
        enumeratorName: formData.enumerator_name || '',
        enumeratorPhone:
          formData.enumerator_introduction?.enumerator_phone || '',
        buildingOwnerName: formData.building_owner_name || '',
        buildingOwnerPhone: '', // Not in sample data
        totalFamilies,
        totalBusinesses,
        buildingGpsLatitude: gpsData.latitude,
        buildingGpsLongitude: gpsData.longitude,
        buildingGpsAltitude: gpsData.altitude,
        buildingGpsAccuracy: gpsData.accuracy,
        buildingOwnershipStatus: formData.ownership_status || '',
        buildingOwnershipStatusOther: formData.other_ownership_status || '',
        buildingBase: formData.house_base || '',
        buildingBaseOther: formData.house_base_other || '',
        buildingOuterWall: formData.house_outer_wall || '',
        buildingOuterWallOther: formData.house_outer_wall_other || '',
        buildingRoof: formData.house_roof || '',
        buildingRoofOther: formData.house_roof_other || '',
        naturalDisasters: naturalDisastersArray,
        naturalDisastersOther: formData.natural_disasters_other || '',
        buildingImageKey: formData.building_image || '',
        buildingEnumeratorSelfieKey: formData.enumerator_selfie || '',
        buildingAudioRecordingKey: formData.monitoring_audio || '',
      };

      this.logger.log(
        `Successfully parsed building data with token: ${result.buildingToken}`,
      );
      this.logger.debug('Parsed building result:', result);

      return result;
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
}
