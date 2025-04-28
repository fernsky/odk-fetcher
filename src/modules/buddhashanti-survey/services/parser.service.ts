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
      this.logger.log(
        `Starting to parse building data with ID: ${buildingData.__id || 'unknown'}`,
      );
      this.logger.debug('Building data input:', buildingData.data);

      // Handle building data in the format from the sample data
      const formData = buildingData.data;

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

  async parseHousehold(
    householdData: Record<string, any>,
  ): Promise<HouseholdData> {
    try {
      this.logger.log(
        `Starting to parse household data with ID: ${householdData.__id || 'unknown'}`,
      );
      this.logger.debug('Household data input:', householdData.data);

      // Handle household data in the format from family sample data
      const formData = householdData.data;

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

  async parseBusiness(
    businessData: Record<string, any>,
  ): Promise<BusinessData> {
    try {
      this.logger.log(
        `Starting to parse business data with ID: ${businessData.__id || 'unknown'}`,
      );
      this.logger.debug('Business data input:', businessData.data);

      // Handle business data in the format from the business sample data
      const formData = businessData.data;

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

  calculateSimilarityScore(token1: string, token2: string): number {
    this.logger.debug(
      `Calculating similarity between "${token1}" and "${token2}"`,
    );
    if (!token1 || !token2) {
      this.logger.debug('One or both tokens empty, returning 0');
      return 0;
    }

    // Use string-similarity library to calculate similarity
    const score = stringSimilarity.compareTwoStrings(
      token1.toLowerCase(),
      token2.toLowerCase(),
    );

    this.logger.debug(`Similarity score: ${score}`);
    return score;
  }
}
