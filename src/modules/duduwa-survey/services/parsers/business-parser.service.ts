import { Injectable } from '@nestjs/common';
import { SurveyData } from '@app/modules/drizzle/duduwa-db/schema';
import { RawBusiness } from '../../../odk/duduwa-services/parser/business/types';
import { BusinessData } from '../../model/business-data.model';
import { BaseParserService } from './base-parser.service';
import {
  decodeSingleChoice,
  decodeMultipleChoices,
} from '@app/common/utils/data';
import { businessChoices } from '../../../odk/duduwa-services/resources/business';

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
      const formData = actualBusinessData;

      this.logger.log(
        `Starting to parse business data with ID: ${formData.__id || 'unknown'}`,
      );

      // Process GPS data from b_location
      let gpsData = {
        latitude: null,
        longitude: null,
        altitude: null,
        accuracy: null,
      };

      this.logger.debug('Processing business GPS data');
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
        } else if (formData.b_location.type === 'Point') {
          // Handle GeoJSON format
          this.logger.debug('Parsing business GPS from GeoJSON format');
          const coords = formData.b_location.coordinates;
          gpsData = {
            latitude: coords[1] || null,
            longitude: coords[0] || null,
            altitude: coords[2] || null,
            accuracy: formData.b_location.properties?.accuracy || 0,
          };
        }
      }

      // Process agricultural business data
      let agricultureSummary = null;
      if (
        formData.bag &&
        formData.business_nature ===
          'agriculture_livestock_fish_and_beekeeping_farm'
      ) {
        this.logger.debug('Processing agriculture business data');

        // Count different types of crops
        const foodCropCount = formData.bag.bagd?.fcrop_details?.length || 0;
        const pulseCount = formData.bag.bagd?.pulse_details?.length || 0;
        const oilSeedCount = formData.bag.bagd?.oseed_details?.length || 0;
        const vegetableCount = formData.bag.bagd?.vtable_detail?.length || 0;
        const fruitCount = formData.bag.bagd?.fruit_details?.length || 0;
        const spiceCount = formData.bag.bagd?.spice_details?.length || 0;
        const cashCropCount = formData.bag.bagd?.ccrop_details?.length || 0;

        // Count animals and their products
        const animalCount = Array.isArray(formData.bag.banimal_details)
          ? formData.bag.banimal_details.length
          : 0;
        const animalProductCount = Array.isArray(formData.bag.baprod_details)
          ? formData.bag.baprod_details.length
          : 0;

        agricultureSummary = {
          crops_summary: {
            food_crops_count: foodCropCount,
            pulse_crops_count: pulseCount,
            oil_seed_crops_count: oilSeedCount,
            vegetable_crops_count: vegetableCount,
            fruit_crops_count: fruitCount,
            spice_crops_count: spiceCount,
            cash_crops_count: cashCropCount,
          },
          livestock_summary: {
            animals_count: animalCount,
            animal_products_count: animalProductCount,
          },
        };
      }

      // Process aquaculture details if present
      let aquacultureData = null;
      if (formData.bag?.aquaculture_details) {
        const aqua = formData.bag.aquaculture_details;
        aquacultureData = {
          aquaculture: {
            pond_count: aqua.pond_no,
            pond_area: aqua.pond_area,
            fish_production: aqua.fish_prod,
            fingerling_number: aqua.BC01_3,
            total_investment: aqua.BC01_5,
            annual_income: aqua.BC01_7,
            employment_count: aqua.BC01_9,
          },
        };
      }

      // Process apiculture details if present
      let apicultureData = null;
      if (formData.bag?.apiculture_details) {
        const api = formData.bag.apiculture_details;
        apicultureData = {
          apiculture: {
            hive_count: api.hive_no,
            honey_production: api.honey_prod,
          },
        };
      }

      // Process crops data from different types
      const crops = this.parseCrops(formData);

      // Process animals data
      const animals = this.parseAnimals(formData);

      // Process animal products data
      const animalProducts = this.parseAnimalProducts(formData);

      // Create the business data object with all fields from the model
      const result: BusinessData = {
        // Basic business information
        id: formData.__id || '',
        business_survey_date:
          formData.start_date || formData.__system?.submissionDate || null,
        business_submission_date: formData.__system?.submissionDate || null,
        business_name: formData.business_name || 'Unnamed business',
        business_nature:
          decodeSingleChoice(
            formData.business_nature,
            businessChoices.business_natures,
          ) || '',
        business_nature_other: formData.business_nature_other || null,
        business_type: formData.business_type
          ? decodeSingleChoice(
              formData.business_type,
              businessChoices.business_types,
            )
          : null,
        business_type_other: formData.business_type_other || null,

        // Temporary Measures
        temporary_area_code: formData.b_addr?.area_code || null,
        temporary_ward_number: formData.b_addr?.ward_no?.toString() || null,
        temporary_building_token:
          formData.enumerator_introduction?.building_token_number || null,

        // Location information
        business_gps_latitude: gpsData.latitude,
        business_gps_longitude: gpsData.longitude,
        business_gps_altitude: gpsData.altitude,
        business_gps_accuracy: gpsData.accuracy,
        business_locality: formData.b_addr?.locality || '',
        ward_number: formData.b_addr?.ward_no || 0,
        area_code: formData.b_addr?.area_code || '',
        business_number: formData.b_addr?.biz_no || null,

        // Operator information
        operator_name: formData.b?.op_name || '',
        operator_phone: formData.b?.opph || '',
        operator_age: formData.b?.op_age || null,
        operator_gender: formData.b?.op_gender
          ? decodeSingleChoice(formData.b.op_gender, businessChoices.genders)
          : null,
        operator_education_level: formData.b?.op_edu_lvl
          ? decodeSingleChoice(
              formData.b.op_edu_lvl,
              businessChoices.educational_level,
            )
          : null,

        // Legal information
        registration_status: formData.is_registered
          ? decodeSingleChoice(
              formData.is_registered,
              businessChoices.true_false,
            )
          : null,
        registered_bodies: formData.registered_bodies
          ? decodeMultipleChoices(
              formData.registered_bodies,
              businessChoices.governmental_bodies,
            )
          : null,
        registered_bodies_other: formData.registered_bodies_other || null,
        statutory_status: formData.statutory_status
          ? decodeSingleChoice(
              formData.statutory_status,
              businessChoices.statutory_status,
            )
          : null,
        statutory_status_other: formData.statutory_status_other || null,
        pan_status: formData.has_pan
          ? decodeSingleChoice(formData.has_pan, businessChoices.true_false)
          : null,
        pan_number: formData.pan_no || null,
        ownership_status: formData.ownership_status
          ? decodeSingleChoice(
              formData.ownership_status,
              businessChoices.business_ownerships,
            )
          : null,
        ownership_status_other: formData.ownership_status_oth || null,

        // Financial information
        investment_amount: formData.investment || null,
        business_location_ownership: formData.business_location_ownership
          ? decodeSingleChoice(
              formData.business_location_ownership,
              businessChoices.business_location_ownerships,
            )
          : null,
        business_location_ownership_other:
          formData.business_location_ownership_oth || null,

        // Hotel specific information
        hotel_accommodation_type: formData.hotel?.accomodation_type
          ? decodeSingleChoice(
              formData.hotel.accomodation_type,
              businessChoices.accomodation_types,
            )
          : null,
        hotel_room_count: formData.hotel?.room_no || null,
        hotel_bed_count: formData.hotel?.bed_no || null,
        hotel_room_type: formData.hotel?.room_type
          ? decodeSingleChoice(
              formData.hotel.room_type,
              businessChoices.room_types,
            )
          : null,
        hotel_has_hall: formData.hotel?.has_hall
          ? decodeSingleChoice(
              formData.hotel.has_hall,
              businessChoices.true_false,
            )
          : null,
        hotel_hall_capacity: formData.hotel?.hcpcty || null,

        // Agricultural business specific information
        agricultural_type: formData.bag?.agri_business || null,

        // Add crop and livestock summaries if available
        ...(agricultureSummary || {}),

        // Add aquaculture information if available
        ...(aquacultureData || {}),

        // Add apiculture information if available
        ...(apicultureData || {}),

        // Add embedded arrays
        crops: crops,
        animals: animals,
        animal_products: animalProducts,

        // Employee information - Partners
        has_partners: formData.emp?.has_partners
          ? decodeSingleChoice(
              formData.emp.has_partners,
              businessChoices.true_false,
            )
          : null,
        total_partners: formData.emp?.prt?.total_partners || null,
        nepali_male_partners: formData.emp?.prt?.nepali_male_partners || null,
        nepali_female_partners:
          formData.emp?.prt?.nepali_female_partners || null,
        has_foreign_partners: formData.emp?.prt?.has_foreign_partners
          ? decodeSingleChoice(
              formData.emp.prt.has_foreign_partners,
              businessChoices.true_false,
            )
          : null,
        foreign_male_partners: formData.emp?.prt?.foreign_male_partners || null,
        foreign_female_partners:
          formData.emp?.prt?.foreign_female_partners || null,

        // Employee information - Family
        has_involved_family: formData.emp?.has_involved_family
          ? decodeSingleChoice(
              formData.emp.has_involved_family,
              businessChoices.true_false,
            )
          : null,
        total_involved_family:
          formData.emp?.efam?.total_involved_family || null,
        male_involved_family: formData.emp?.efam?.male_involved_family || null,
        female_involved_family:
          formData.emp?.efam?.female_involved_family || null,

        // Employee information - Permanent
        has_permanent_employees: formData.emp?.has_perm_employees
          ? decodeSingleChoice(
              formData.emp.has_perm_employees,
              businessChoices.true_false,
            )
          : null,
        total_permanent_employees:
          formData.emp?.etemp?.total_perm_employees || null,
        nepali_male_permanent_employees:
          formData.emp?.etemp?.nepali_male_perm_employees || null,
        nepali_female_permanent_employees:
          formData.emp?.etemp?.nepali_female_perm_employees || null,
        has_foreign_permanent_employees: formData.emp?.etemp
          ?.has_foreign_perm_employees
          ? decodeSingleChoice(
              formData.emp.etemp.has_foreign_perm_employees,
              businessChoices.true_false,
            )
          : null,
        foreign_male_permanent_employees:
          formData.emp?.etemp?.foreign_male_perm_employees || null,
        foreign_female_permanent_employees:
          formData.emp?.etemp?.foreign_female_perm_employees || null,

        // Employee information - Temporary
        has_temporary_employees: formData.emp?.has_temp_employees
          ? decodeSingleChoice(
              formData.emp.has_temp_employees,
              businessChoices.true_false,
            )
          : null,
        total_temporary_employees:
          formData.emp?.eperm?.total_temp_employees || null,
        nepali_male_temporary_employees:
          formData.emp?.eperm?.nepali_male_temp_employees || null,
        nepali_female_temporary_employees:
          formData.emp?.eperm?.nepali_female_temp_employees || null,
        has_foreign_temporary_employees: formData.emp?.eperm
          ?.has_foreign_temp_employees
          ? decodeSingleChoice(
              formData.emp.eperm.has_foreign_temp_employees,
              businessChoices.true_false,
            )
          : null,
        foreign_male_temporary_employees:
          formData.emp?.eperm?.foreign_male_temp_employees || null,
        foreign_female_temporary_employees:
          formData.emp?.eperm?.foreign_female_temp_employees || null,

        // Media attachment keys
        business_image_key: formData.bimg || '',
        business_enumerator_selfie_key: formData.bimg_selfie || '',
        business_audio_recording_key: formData.audio_monitoring || '',
      };

      this.logger.log(
        `Successfully parsed business data for: ${result.business_name}`,
      );
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

  /**
   * Parse crops from all different types (food crops, pulses, oil seeds, vegetables, fruits, spices, cash crops)
   */
  private parseCrops(formData: Record<string, any>) {
    try {
      const crops = [];
      const businessId = formData.__id || '';
      const wardNumber = formData.b_addr?.ward_no || 0;

      // Process food crops
      if (formData.bag?.bagd?.fcrop_details?.length > 0) {
        for (const fcrop of formData.bag.bagd.fcrop_details) {
          try {
            crops.push({
              id: fcrop.__id,
              business_id: businessId,
              crop_type: 'अन्नबाली',
              crop_name: fcrop.fcrop,
              ward_number: wardNumber,
              crop_area:
                (fcrop.fcrop_land.fbigha || 0) * 6772.63 +
                (fcrop.fcrop_land.fkattha || 0) * 338.63 +
                (fcrop.fcrop_land.fdhur || 0) * 16.93,
              crop_production: fcrop.fp?.fcrop_prod || '',
              crop_sales: fcrop.fs?.fcrop_sales || '',
            });
          } catch (e) {
            const errorMessage =
              e instanceof Error ? e.message : 'Unknown error';
            this.logger.warn(`Error processing food crop: ${errorMessage}`);
          }
        }
      }

      // Process pulses
      if (formData.bag?.bagd?.pulse_details?.length > 0) {
        for (const pulse of formData.bag.bagd.pulse_details) {
          try {
            crops.push({
              id: pulse.__id,
              business_id: businessId,
              crop_type: 'दलहन',
              crop_name: pulse.pulse,
              ward_number: wardNumber,
              crop_area:
                (pulse.pl?.pulse_bigha || 0) * 6772.63 +
                (pulse.pl?.pulse_kattha || 0) * 338.63 +
                (pulse.pl?.pulse_dhur || 0) * 16.93,
              crop_production: pulse.pp?.pulse_prod || '',
              crop_sales: pulse.ps?.pulse_sales || '',
            });
          } catch (e) {
            const errorMessage =
              e instanceof Error ? e.message : 'Unknown error';
            this.logger.warn(`Error processing pulse crop: ${errorMessage}`);
          }
        }
      }

      // Process oil seeds
      if (formData.bag?.bagd?.oseed_details?.length > 0) {
        for (const oseed of formData.bag.bagd.oseed_details) {
          try {
            crops.push({
              id: oseed.__id,
              business_id: businessId,
              crop_type: 'तेलहन',
              crop_name: oseed.oseed,
              ward_number: wardNumber,
              crop_area:
                (oseed.osl?.os_bigha || 0) * 6772.63 +
                (oseed.osl?.os_kattha || 0) * 338.63 +
                (oseed.osl?.os_dhur || 0) * 16.93,
              crop_production: oseed.oslp?.oseed_prod || '',
              crop_sales: oseed.osls?.oseed_sales || '',
            });
          } catch (e) {
            const errorMessage =
              e instanceof Error ? e.message : 'Unknown error';
            this.logger.warn(`Error processing oil seed crop: ${errorMessage}`);
          }
        }
      }

      // Process vegetables
      if (formData.bag?.bagd?.vtable_detail?.length > 0) {
        for (const veg of formData.bag.bagd.vtable_detail) {
          try {
            crops.push({
              id: veg.__id,
              business_id: businessId,
              crop_type: 'तरकारी',
              crop_name: veg.vtable,
              ward_number: wardNumber,
              crop_area:
                (veg.vl?.vt_bigha || 0) * 6772.63 +
                (veg.vl?.vt_kattha || 0) * 338.63 +
                (veg.vl?.vt_dhur || 0) * 16.93,
              crop_production: veg.vp?.vtable_prod || '',
              crop_sales: veg.vs?.vtable_sales || '',
            });
          } catch (e) {
            const errorMessage =
              e instanceof Error ? e.message : 'Unknown error';
            this.logger.warn(
              `Error processing vegetable crop: ${errorMessage}`,
            );
          }
        }
      }

      // Process fruits
      if (formData.bag?.bagd?.fruit_details?.length > 0) {
        for (const fruit of formData.bag.bagd.fruit_details) {
          try {
            crops.push({
              id: fruit.__id,
              business_id: businessId,
              crop_type: 'फलफूल',
              crop_name: fruit.fruit,
              ward_number: wardNumber,
              crop_area:
                (fruit.frl?.fruit_bigha || 0) * 6772.63 +
                (fruit.frl?.fruit_kattha || 0) * 338.63 +
                (fruit.frl?.fruit_dhur || 0) * 16.93,
              crop_production: fruit.frp?.fruit_prod || '',
              crop_count: fruit.frl?.fruit_trees_count || null,
              crop_sales: fruit.frs?.fruit_sales || '',
            });
          } catch (e) {
            const errorMessage =
              e instanceof Error ? e.message : 'Unknown error';
            this.logger.warn(`Error processing fruit crop: ${errorMessage}`);
          }
        }
      }

      // Process spices
      if (formData.bag?.bagd?.spice_details?.length > 0) {
        for (const spice of formData.bag.bagd.spice_details) {
          try {
            crops.push({
              id: spice.__id,
              business_id: businessId,
              crop_type: 'मसला',
              crop_name: spice.spice,
              ward_number: wardNumber,
              crop_area:
                (spice.sl?.spice_bigha || 0) * 6772.63 +
                (spice.sl?.spice_kattha || 0) * 338.63 +
                (spice.sl?.spice_dhur || 0) * 16.93,
              crop_production: spice.sp?.spice_prod || '',
              crop_sales: spice.ss?.spice_sales || '',
            });
          } catch (e) {
            const errorMessage =
              e instanceof Error ? e.message : 'Unknown error';
            this.logger.warn(`Error processing spice crop: ${errorMessage}`);
          }
        }
      }

      // Process cash crops
      if (formData.bag?.bagd?.ccrop_details?.length > 0) {
        for (const ccrop of formData.bag.bagd.ccrop_details) {
          try {
            crops.push({
              id: ccrop.__id,
              business_id: businessId,
              crop_type: 'नगदेबाली',
              crop_name: ccrop.ccrop,
              ward_number: wardNumber,
              crop_area:
                (ccrop.cl?.cash_bigha || 0) * 6772.63 +
                (ccrop.cl?.cash_kattha || 0) * 338.63 +
                (ccrop.cl?.cash_dhur || 0) * 16.93,
              crop_production: ccrop.cp?.ccrop_prod || '',
              crop_count: ccrop.cl?.betet_trees_count || null,
              crop_sales: ccrop.cs?.ccrop_sales || '',
            });
          } catch (e) {
            const errorMessage =
              e instanceof Error ? e.message : 'Unknown error';
            this.logger.warn(`Error processing cash crop: ${errorMessage}`);
          }
        }
      }

      return crops;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Error parsing crops: ${errorMessage}`);
      return [];
    }
  }

  /**
   * Parse animals data
   */
  private parseAnimals(formData: Record<string, any>) {
    try {
      const animals = [];
      const businessId = formData.__id || '';
      const wardNumber = formData.b_addr?.ward_no || 0;

      if (
        Array.isArray(formData.bag?.banimal_details) &&
        formData.bag.banimal_details.length > 0
      ) {
        for (const animal of formData.bag.banimal_details) {
          try {
            if (animal.banim?.b_animal_oth) {
              // Handle other animal types
              animals.push({
                id: animal.__id,
                business_id: businessId,
                animal_name: animal.banim.b_animal_oth,
                ward_number: animal.animal_ward_no || wardNumber,
                animal_type: 'livestock',
                total_count: animal.banim.othtotal_b_animals || 0,
                sales_count: animal.banim.othb_animal_sales || 0,
                revenue: animal.banim.othb_animal_revenue || 0,
              });
            } else {
              // Handle normal animal types
              animals.push({
                id: animal.__id,
                business_id: businessId,
                animal_name: animal.b_animal,
                ward_number: animal.animal_ward_no || wardNumber,
                animal_type: 'livestock',
                total_count: animal.banimn?.total_b_animals || 0,
                sales_count: animal.banimn?.b_animal_sales || 0,
                revenue: animal.banimn?.b_animal_revenue || 0,
              });
            }
          } catch (e) {
            const errorMessage =
              e instanceof Error ? e.message : 'Unknown error';
            this.logger.warn(`Error processing animal: ${errorMessage}`);
          }
        }
      }

      return animals;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Error parsing animals: ${errorMessage}`);
      return [];
    }
  }

  /**
   * Parse animal products data
   */
  private parseAnimalProducts(formData: Record<string, any>) {
    try {
      const animalProducts = [];
      const businessId = formData.__id || '';
      const wardNumber = formData.b_addr?.ward_no || 0;

      if (
        Array.isArray(formData.bag?.baprod_details) &&
        formData.bag.baprod_details.length > 0
      ) {
        for (const product of formData.bag.baprod_details) {
          try {
            if (product.baprd?.baprod_oth) {
              // Handle other animal product types
              animalProducts.push({
                id: product.__id,
                business_id: businessId,
                product_name: product.baprd.baprod_oth,
                ward_number: product.aprod_ward_no || wardNumber,
                unit:
                  decodeSingleChoice(
                    product.baprd.oth_baprod_unit,
                    businessChoices.animal_prods_unit,
                  ) || '',
                production_amount: product.baprd.oth_b_aprod_prod || 0,
                sales_amount: product.baprd.oth_aprod_sales || 0,
                monthly_production: product.baprd.oth_b_month_aprod || 0,
                revenue: product.baprd.oth_aprod_revenue || 0,
              });
            } else {
              // Handle normal animal product types
              animalProducts.push({
                id: product.__id,
                business_id: businessId,
                product_name: product.b_aprod,
                ward_number: product.aprod_ward_no || wardNumber,
                unit:
                  product.baprdn?.baprod_unit ||
                  product.baprdn?.aprod_unit_oth ||
                  '',
                production_amount: product.baprdn?.b_aprod_prod || 0,
                sales_amount: product.baprdn?.approd_sales || 0,
                monthly_production: product.baprdn?.b_month_aprod || 0,
                revenue: product.baprdn?.approd_revenue || 0,
              });
            }
          } catch (e) {
            const errorMessage =
              e instanceof Error ? e.message : 'Unknown error';
            this.logger.warn(
              `Error processing animal product: ${errorMessage}`,
            );
          }
        }
      }

      return animalProducts;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Error parsing animal products: ${errorMessage}`);
      return [];
    }
  }
}
