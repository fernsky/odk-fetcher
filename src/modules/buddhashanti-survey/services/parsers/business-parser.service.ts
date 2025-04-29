import { Injectable } from '@nestjs/common';
import { SurveyData } from '@app/modules/drizzle/buddhashanti-db/schema';
import { RawBusiness } from '../../../odk/buddhashanti-services/parser/business/types';
import { BusinessData } from '../../model/buddhashanti-aggregate-buildings';
import { BaseParserService } from './base-parser.service';

@Injectable()
export class BusinessParserService extends BaseParserService {
  constructor() {
    super(BusinessParserService.name);
  }

  async parseBusiness(
    businessData: Record<string, any> | SurveyData<RawBusiness>,
  ): Promise<BusinessData> {
    try {
      // Handle data whether it comes directly or wrapped in SurveyData
      const actualBusinessData = this.extractDataFromSurvey(businessData);

      this.logger.log(
        `Starting to parse business data with ID: ${actualBusinessData.__id || 'unknown'}`,
      );

      // Handle business data in the format from the business sample data
      const formData = actualBusinessData;

      // Process GPS data from b_location
      let gpsData = {
        latitude: null,
        longitude: null,
        altitude: null,
        accuracy: null,
      };

      this.logger.log('Processing business GPS data');
      if (formData.b_location) {
        if (typeof formData.b_location === 'string') {
          // Parse the POINT string format
          this.logger.debug(
            'Parsing business GPS from string format:',
            formData.b_location,
          );
          const coords = formData.b_location
            .replace('POINT (', '')
            .replace(')', '')
            .split(' ');
          gpsData = {
            latitude: parseFloat(coords[1]) || null,
            longitude: parseFloat(coords[0]) || null,
            altitude: parseFloat(coords[2]) || null,
            accuracy: 0,
          };
          this.logger.debug('Parsed business GPS coordinates:', gpsData);
        } else if (formData.b_location.type === 'Point') {
          // Handle GeoJSON format
          this.logger.debug(
            'Parsing business GPS from GeoJSON format:',
            formData.b_location,
          );
          const coords = formData.b_location.coordinates;
          gpsData = {
            latitude: coords[1] || null,
            longitude: coords[0] || null,
            altitude: coords[2] || null,
            accuracy: formData.b_location.properties?.accuracy || 0,
          };
          this.logger.debug('Parsed business GPS coordinates:', gpsData);
        } else {
          this.logger.warn(
            'Unrecognized business GPS data format:',
            formData.b_location,
          );
        }
      } else {
        this.logger.warn('No GPS data found for business');
      }

      const businessName = formData.business_name || 'Unnamed business';
      this.logger.debug(`Business name: ${businessName}`);

      const businessType = formData.business_nature || '';
      this.logger.debug(`Business type: ${businessType}`);

      this.logger.log(
        `Processing business in ward: ${formData.b_addr?.ward_no || 'unknown'}`,
      );

      const result = {
        business_survey_date: formData.start_date || null,
        business_submission_date: formData.__system?.submissionDate || null,
        business_gps_latitude: gpsData.latitude,
        business_gps_longitude: gpsData.longitude,
        business_gps_altitude: gpsData.altitude,
        business_gps_accuracy: gpsData.accuracy,
        business_locality: formData.b_addr?.locality || '',
        business_image_key: formData.bimg || '',
        business_enumerator_selfie_key: formData.bimg_selfie || '',
        business_audio_recording_key: formData.audio_monitoring || '',
      };

      this.logger.log(`Successfully parsed business data for: ${businessName}`);
      this.logger.debug('Parsed business result:', result);

      return result;
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
}
