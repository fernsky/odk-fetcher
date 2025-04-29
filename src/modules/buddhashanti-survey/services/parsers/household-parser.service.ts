import { Injectable } from '@nestjs/common';
import { SurveyData } from '@app/modules/drizzle/buddhashanti-db/schema';
import { RawFamily } from '../../../odk/buddhashanti-services/parser/family/types';
import { HouseholdData } from '../../model/household-data.model';
import { BaseParserService } from './base-parser.service';

@Injectable()
export class HouseholdParserService extends BaseParserService {
  constructor() {
    super(HouseholdParserService.name);
  }

  async parseHousehold(
    householdData: Record<string, any> | SurveyData<RawFamily>,
  ): Promise<HouseholdData> {
    try {
      // Handle data whether it comes directly or wrapped in SurveyData
      const actualHouseholdData = this.extractDataFromSurvey(householdData);

      this.logger.log(
        `Starting to parse household data with ID: ${actualHouseholdData.__id || 'unknown'}`,
      );

      // Handle household data in the format from family sample data
      const formData = actualHouseholdData;

      // Process GPS data from the id.tmp_location or id.location
      let gpsData = {
        latitude: null,
        longitude: null,
        altitude: null,
        accuracy: null,
      };

      this.logger.log('Processing household GPS data');
      if (formData.id?.tmp_location) {
        // GeoJSON format
        this.logger.debug(
          'Parsing household GPS from GeoJSON format:',
          formData.id.tmp_location,
        );
        const coords = formData.id.tmp_location.coordinates;
        gpsData = {
          latitude: coords[1] || null,
          longitude: coords[0] || null,
          altitude: coords[2] || null,
          accuracy: formData.id.tmp_location.properties?.accuracy || 0,
        };
        this.logger.debug('Parsed household GPS coordinates:', gpsData);
      } else if (formData.id?.location) {
        // String format: "latitude longitude altitude accuracy"
        this.logger.debug(
          'Parsing household GPS from string format:',
          formData.id.location,
        );
        const coords = formData.id.location.split(' ');
        if (coords.length >= 2) {
          gpsData = {
            latitude: parseFloat(coords[0]) || null,
            longitude: parseFloat(coords[1]) || null,
            altitude: parseFloat(coords[2]) || null,
            accuracy: parseFloat(coords[3]) || 0,
          };
          this.logger.debug('Parsed household GPS coordinates:', gpsData);
        } else {
          this.logger.warn(
            'Insufficient coordinates in household location string',
          );
        }
      } else {
        this.logger.warn('No GPS data found for household');
      }

      const surveyDate = formData.start_doi || formData.id?.doi || null;
      this.logger.debug(`Household survey date parsed: ${surveyDate}`);

      const submissionDate = formData.__system?.submissionDate || null;
      this.logger.debug(`Household submission date parsed: ${submissionDate}`);

      const result = {
        household_survey_date: surveyDate,
        household_submission_date: submissionDate,
        household_gps_latitude: gpsData.latitude,
        household_gps_longitude: gpsData.longitude,
        household_gps_altitude: gpsData.altitude,
        household_gps_accuracy: gpsData.accuracy,
        household_locality: formData.id?.locality || '',
        household_development_organization: formData.id?.dev_org || '',
        household_image_key: formData.himg || '',
        household_enumerator_selfie_key: formData.himg_selfie || '',
        household_audio_recording_key: formData.audio_monitoring || '',
      };

      this.logger.log('Successfully parsed household data');
      this.logger.debug('Parsed household result:', result);

      return result;
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
}
