import { Injectable } from '@nestjs/common';
import { SurveyData } from '@app/modules/drizzle/kerabari-db/schema';
import { RawBuildingData } from '../../../odk/kerabari-services/parser/parse-buildings';
import { BaseParserService } from './base-parser.service';
import { decodeSingleChoice } from '@app/common/utils/data';
import { buildingChoices } from '../../../odk/kerabari-services/resources/building';

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
        ? new Date(formData.survey_date).toISOString()
        : null;
      this.logger.debug(
        `Survey date parsed: ${buildingSurveyDate} from source: ${formData.survey_date}`,
      );

      const buildingSubmissionDate = formData.__system?.submissionDate
        ? new Date(formData.__system.submissionDate).toISOString()
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
        id: formData.__id || '',
        building_id: formData.__id || '',
        building_token: formData.building_token || '',
        ward_number: wardNumber,
        area_code: areaCode,
        locality: formData.locality || '',
        building_survey_date: buildingSurveyDate,
        building_submission_date: buildingSubmissionDate,
        enumerator_id: formData.enumerator_id || '',
        enumerator_name: formData.enumerator_name || '',
        enumerator_phone:
          formData.enumerator_introduction?.enumerator_phone || '',
        building_owner_name: formData.building_owner_name || '',
        building_owner_phone: formData.building_owner_phone || '', // Not in sample data
        total_families: totalFamilies,
        total_businesses: totalBusinesses,
        building_gps_latitude: gpsData.latitude,
        building_gps_longitude: gpsData.longitude,
        building_gps_altitude: gpsData.altitude,
        building_gps_accuracy: gpsData.accuracy,

        // Building characteristics
        building_ownership_status: decodeSingleChoice(
          formData.ownership_status,
          buildingChoices.house_ownership,
        ),
        building_ownership_status_other: formData.other_ownership_status || '',
        building_base:
          decodeSingleChoice(formData.house_base, buildingChoices.house_base) ||
          '',
        building_base_other: formData.house_base_other || '',
        building_outer_wall:
          decodeSingleChoice(
            formData.house_outer_wall,
            buildingChoices.house_outer_wall,
          ) || '',
        building_outer_wall_other: formData.house_outer_wall_other || '',
        building_roof:
          decodeSingleChoice(formData.house_roof, buildingChoices.house_roof) ||
          '',
        building_roof_other: formData.house_roof_other || '',

        // New fields from comprehensive model
        building_floor:
          decodeSingleChoice(
            formData.house_floor,
            buildingChoices.house_floor,
          ) || '',
        building_floor_other: formData.house_floor_other || '',
        map_status:
          decodeSingleChoice(formData.map_status, buildingChoices.map_status) ||
          '',

        // Natural disaster information
        natural_disasters: naturalDisastersArray,
        natural_disasters_other: formData.natural_disasters_other || '',

        // Accessibility metrics
        time_to_market:
          decodeSingleChoice(formData.time_to_market, buildingChoices.time) ||
          '',
        time_to_active_road:
          decodeSingleChoice(formData.time_to_act_road, buildingChoices.time) ||
          '',
        time_to_public_bus:
          decodeSingleChoice(formData.time_to_pub_bus, buildingChoices.time) ||
          '',
        time_to_health_organization:
          decodeSingleChoice(
            formData.time_to_health_inst,
            buildingChoices.time,
          ) || '',
        time_to_financial_organization:
          decodeSingleChoice(
            formData.time_to_financial_org,
            buildingChoices.time,
          ) || '',
        road_status:
          decodeSingleChoice(
            formData.road_status,
            buildingChoices.road_status,
          ) || '',
        road_status_other: formData.road_status_other || '',

        // Media keys
        building_image_key: formData.building_image || '',
        building_enumerator_selfie_key: formData.enumerator_selfie || '',
        building_audio_recording_key: formData.monitoring_audio || '',
      };

      this.logger.log(
        `Successfully parsed building data with token: ${result.building_token}`,
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
