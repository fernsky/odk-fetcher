import { Injectable } from '@nestjs/common';
import { SurveyData } from '@app/modules/drizzle/duduwa-db/schema';
import { RawFamily } from '../../../odk/duduwa-services/parser/family/types';
import { HouseholdData } from '../../model/household-data.model';
import { BaseParserService } from './base-parser.service';
import {
  decodeSingleChoice,
  decodeMultipleChoices,
} from '@app/common/utils/data';
import { familyChoices } from '../../../odk/duduwa-services/resources/family';

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
      const formData = actualHouseholdData;

      this.logger.log(
        `Starting to parse household data with ID: ${formData.__id || 'unknown'}`,
      );

      // Process GPS data from the id.tmp_location or id.location
      let gpsData = {
        latitude: null,
        longitude: null,
        altitude: null,
        accuracy: null,
      };

      this.logger.debug('Processing household GPS data');
      if (formData.id?.tmp_location) {
        // GeoJSON format
        this.logger.debug('Parsing household GPS from GeoJSON format');
        const coords = formData.id.tmp_location.coordinates;
        gpsData = {
          latitude: coords[1] || null,
          longitude: coords[0] || null,
          altitude: coords[2] || null,
          accuracy: formData.id.tmp_location.properties?.accuracy || 0,
        };
      } else if (formData.id?.location) {
        // String format: "latitude longitude altitude accuracy"
        this.logger.debug('Parsing household GPS from string format');
        const coords = formData.id.location.split(' ');
        if (coords.length >= 2) {
          gpsData = {
            latitude: parseFloat(coords[0]) || null,
            longitude: parseFloat(coords[1]) || null,
            altitude: parseFloat(coords[2]) || null,
            accuracy: parseFloat(coords[3]) || 0,
          };
        } else {
          this.logger.warn(
            'Insufficient coordinates in household location string',
          );
        }
      } else {
        this.logger.warn('No GPS data found for household');
      }

      const surveyDate = formData.start_doi || formData.id?.doi || null;
      const submissionDate = formData.__system?.submissionDate || null;

      // Determine family demographics
      const casteDetails = {
        caste: '',
        caste_other: null,
      };

      const languageDetails = {
        ancestral_language: '',
        ancestral_language_other: null,
        primary_mother_tongue: '',
        primary_mother_tongue_other: null,
      };

      const religionDetails = {
        religion: '',
        religion_other: null,
      };

      // Extract family demographics if it's a family
      if (
        formData.id?.members?.are_a_family === 'yes' &&
        formData.family_history_info
      ) {
        const fhi = formData.family_history_info;

        casteDetails.caste =
          decodeSingleChoice(fhi.caste, familyChoices.castes) || '';
        casteDetails.caste_other = fhi.caste_oth || null;

        languageDetails.ancestral_language =
          decodeSingleChoice(fhi.ancestrial_lang, familyChoices.languages) ||
          '';
        languageDetails.ancestral_language_other =
          fhi.ancestrial_lang_oth || null;
        languageDetails.primary_mother_tongue =
          decodeSingleChoice(
            fhi.mother_tounge_primary,
            familyChoices.languages,
          ) || '';
        languageDetails.primary_mother_tongue_other =
          fhi.mother_tounge_primary_oth || null;

        religionDetails.religion =
          decodeSingleChoice(fhi.religion, familyChoices.religions) || '';
        religionDetails.religion_other = fhi.religion_other || null;
      }

      // Process birth place and prior location
      const birthPlaceDetails = {
        birth_place: '',
        birth_province: null,
        birth_district: null,
        birth_country: null,
      };

      const priorLocationDetails = {
        prior_location: null,
        prior_province: null,
        prior_district: null,
        prior_country: null,
        residence_reasons: [],
        residence_reasons_other: null,
      };

      if (formData.id?.members?.are_a_family === 'yes' && formData.bp) {
        const fl = formData.bp;

        birthPlaceDetails.birth_place =
          decodeSingleChoice(fl.birth_place, familyChoices.birth_places) || '';

        if (fl.birth_place === 'another_district') {
          birthPlaceDetails.birth_province = decodeSingleChoice(
            fl.birth_province,
            familyChoices.provinces,
          );
          birthPlaceDetails.birth_district = decodeSingleChoice(
            fl.birth_district,
            familyChoices.districts,
          );
        } else if (fl.birth_place === 'abroad') {
          birthPlaceDetails.birth_country = decodeSingleChoice(
            fl.birth_country,
            familyChoices.countries,
          );
        }

        if (formData.plocation.prior_location) {
          priorLocationDetails.prior_location = decodeSingleChoice(
            formData.plocation.prior_location,
            familyChoices.locations,
          );

          if (fl.prior_location === 'another_district') {
            priorLocationDetails.prior_province = decodeSingleChoice(
              formData.plocation.prior_province,
              familyChoices.provinces,
            );
            priorLocationDetails.prior_district = decodeSingleChoice(
              formData.plocation.prior_district,
              familyChoices.districts,
            );
          } else if (fl.prior_location === 'abroad') {
            priorLocationDetails.prior_country = decodeSingleChoice(
              formData.plocation.prior_country,
              familyChoices.countries,
            );
          }

          priorLocationDetails.residence_reasons =
            decodeMultipleChoices(
              formData.plocation.residence_reasons,
              familyChoices.residence_reasons,
            ) || [];
          priorLocationDetails.residence_reasons_other =
            formData.plocation.residence_reasons_other || null;
        }
      }

      // Process agriculture information
      const agriInfo = {
        has_agricultural_land: false,
        agricultural_land_ownership_types: [],
        is_farmer: false,
        total_male_farmers: 0,
        total_female_farmers: 0,
        months_sustained_from_agriculture: '',
        months_involved_in_agriculture: '',
        agricultural_machinery: [],
      };

      if (formData.agri) {
        agriInfo.has_agricultural_land = formData.agri.has_agland === 'yes';

        if (formData.agri.has_agland === 'yes') {
          agriInfo.agricultural_land_ownership_types =
            decodeMultipleChoices(
              formData.agri.agland_oship_type,
              familyChoices.land_ownership,
            ) || [];
        }

        agriInfo.is_farmer = formData.agri.is_farmer === 'yes';

        if (formData.agri.is_farmer === 'yes') {
          agriInfo.total_male_farmers =
            parseInt(formData.agri.total_male_farmer || '0', 10) || 0;
          agriInfo.total_female_farmers =
            parseInt(formData.agri.total_female_farmer || '0', 10) || 0;
          agriInfo.months_sustained_from_agriculture =
            decodeSingleChoice(
              formData.agri.months_sustained_from_agriculture,
              familyChoices.agricultural_months,
            ) || '';
          agriInfo.months_involved_in_agriculture =
            decodeSingleChoice(
              formData.agri.months_involved_in_agriculture,
              familyChoices.agricultural_months,
            ) || '';
          agriInfo.agricultural_machinery =
            decodeMultipleChoices(
              formData.agri.agri_machines,
              familyChoices.agricultural_machinery,
            ) || [];
        }
      }

      // Animal husbandry
      const animalInfo = {
        has_animal_husbandry: false,
        animal_types: [],
      };

      if (formData.agri && formData.agri.animal_husbandary === 'yes') {
        animalInfo.has_animal_husbandry = true;
        animalInfo.animal_types =
          decodeMultipleChoices(
            formData.agri.animal_husbandary_type,
            familyChoices.animals,
          ) || [];
      }

      // Aquaculture and apiculture

      const aquacultureInfo = {
        has_aquaculture: formData.agri?.has_aquacultured === 'yes' || false,
        pond_count: formData.agri?.aquaculture_details?.pond_no || null,
        pond_area: formData.agri?.aquaculture_details?.pond_area || null,
        fish_production: formData.agri?.aquaculture_details?.fish_prod || null,
      };

      const apicultureInfo = {
        has_apiculture: formData.agri?.has_apicultured === 'yes' || false,
        hive_count: formData.agri?.apiculture_details?.hive_no || null,
        honey_production: formData.agri?.apiculture_details?.honey_prod || null,
      };

      // Process household members
      const householdMembers = this.parseHouseholdMembers(formData);

      // Process agricultural lands
      const agriculturalLands = this.parseAgriculturalLands(formData);

      // Process crops
      const crops = this.parseCrops(formData);

      // Process animals
      const animals = this.parseAnimals(formData);

      // Process animal products
      const animalProducts = this.parseAnimalProducts(formData);

      // Process deaths
      const deaths = this.parseDeaths(formData);

      // Create the household data object with all fields from the model
      const result: HouseholdData = {
        // Identification and basic information
        id: formData.__id || '',
        household_survey_date: surveyDate,
        household_submission_date: submissionDate,
        household_token: formData.enumerator_introduction?.building_token || '',

        // Location information
        household_gps_latitude: gpsData.latitude,
        household_gps_longitude: gpsData.longitude,
        household_gps_altitude: gpsData.altitude,
        household_gps_accuracy: gpsData.accuracy,
        ward_number: parseInt(formData.id?.ward_no || '0', 10) || null,
        area_code: formData.id?.area_code || '',
        household_locality: formData.id?.locality || '',
        household_development_organization: formData.id?.dev_org || '',

        // Family head information
        head_name: formData.id?.head_name || '',
        head_phone: formData.id?.head_ph || '',

        // Household details
        total_members:
          parseInt(formData.id?.members?.total_mem || '0', 10) || 0,
        is_sanitized: formData.id?.members?.is_sanitized === 'yes',

        // House ownership and safety
        house_ownership:
          decodeSingleChoice(
            formData.hh?.h_oship,
            familyChoices.house_ownership,
          ) || '',
        house_ownership_other: formData.hh?.h_oship_oth || null,
        feels_safe: formData.hh?.is_safe === 'yes',

        // Water and sanitation
        water_source:
          decodeMultipleChoices(
            formData.hh?.wsrc,
            familyChoices.drinking_water_source,
          ) || [],
        water_source_other: formData.hh?.water_src_oth || null,
        water_purification_methods:
          decodeMultipleChoices(
            formData.hh?.water_puri,
            familyChoices.water_purification,
          ) || [],
        toilet_type:
          decodeSingleChoice(
            formData.hh?.toilet_type,
            familyChoices.toilet_type,
          ) || '',
        solid_waste_management:
          decodeSingleChoice(
            formData.hh?.solid_waste,
            familyChoices.solid_waste,
          ) || '',
        solid_waste_management_other: formData.hh?.solid_waste_oth || null,

        // Energy and facilities
        primary_cooking_fuel: decodeMultipleChoices(
          formData.hh?.primary_cf,
          familyChoices.cooking_fuel,
        ),
        primary_energy_source: decodeMultipleChoices(
          formData.hh?.primary_es,
          familyChoices.energy_source,
        ),
        primary_energy_source_other: formData.hh?.primary_es_oth || null,
        facilities:
          decodeMultipleChoices(
            formData.hh?.facilitites,
            familyChoices.facilities,
          ) || [],

        // Economic details
        female_properties:
          decodeSingleChoice(
            formData.hh?.fem_prop,
            familyChoices.elsewhere_properties,
          ) || '',
        loaned_organizations:
          decodeMultipleChoices(
            formData.hh?.loaned_organization,
            familyChoices.loaned_organization,
          ) || [],
        loan_use:
          decodeMultipleChoices(
            formData.hh?.loan_use,
            familyChoices.loan_use,
          ) || [],
        financial_organizations:
          decodeMultipleChoices(
            formData.hh?.has_bacc,
            familyChoices.financial_organization,
          ) || [],
        has_insurance: decodeMultipleChoices(
          formData.hh.has_insurance,
          familyChoices.insurances,
        ),
        health_organization:
          decodeSingleChoice(
            formData.hh?.health_org,
            familyChoices.health_organization,
          ) || '',
        health_organization_other: formData.hh?.heatlth_org_oth || null,
        income_sources:
          decodeMultipleChoices(
            formData.hh?.income_sources,
            familyChoices.income_sources,
          ) || [],

        // Remittance
        has_remittance: formData.has_remittance === 'yes',
        remittance_expenses:
          decodeMultipleChoices(
            formData.remittance_expenses,
            familyChoices.remittance_expenses,
          ) || [],

        // Municipal suggestions
        municipal_suggestions:
          decodeMultipleChoices(
            formData.hh?.municipal_suggestions,
            familyChoices.municipal_suggestions,
          ) || [],
        municipal_suggestions_other:
          formData.hh?.municipal_suggestions_oth || null,

        // Demographic information
        ...casteDetails,
        ...languageDetails,
        ...religionDetails,

        // Agriculture information
        ...agriInfo,

        // Animal husbandry
        ...animalInfo,

        // Aquaculture and apiculture
        ...aquacultureInfo,
        ...apicultureInfo,

        // Birth place and prior location
        ...birthPlaceDetails,
        ...priorLocationDetails,

        // Media attachment keys
        household_image_key: formData.himg || '',
        household_enumerator_selfie_key: formData.himg_selfie || '',
        household_audio_recording_key: formData.audio_monitoring || '',

        // Embedded data arrays
        household_members: householdMembers,
        agricultural_lands: agriculturalLands,
        crops: crops,
        animals: animals,
        animal_products: animalProducts,
        deaths: deaths,
      };

      this.logger.log(
        `Successfully parsed household data for family with head: ${result.head_name}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Error parsing household data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new Error(
        `Error parsing household: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Parse household members from the family data
   */
  private parseHouseholdMembers(formData: any) {
    try {
      const members = [];
      const householdId = formData.__id || '';
      if (
        !formData.individual ||
        !Array.isArray(formData.individual) ||
        formData.individual.length === 0
      ) {
        return members;
      }

      for (const individual of formData.individual) {
        try {
          const member = {
            id:
              individual.__id ||
              `mem-${Math.random().toString(36).substring(2, 10)}`,
            household_id: householdId,
            name: individual.name || '',
            gender:
              decodeSingleChoice(individual.gender, familyChoices.genders) ||
              '',
            age: individual.age || 0,

            // Citizenship and demographics
            citizen_of:
              decodeSingleChoice(
                individual.citizenof,
                familyChoices.local_countries,
              ) || '',
            citizen_of_other: individual.citizenof_oth || null,
          };
          this.logger.debug('Processing household member:', member);

          // Add demographics from family or individual
          if (formData.id?.members?.are_a_family === 'yes') {
            member['caste'] =
              decodeSingleChoice(
                formData.family_history_info?.caste,
                familyChoices.castes,
              ) || '';
            member['caste_other'] =
              formData.family_history_info?.caste_oth || null;
            member['ancestral_language'] =
              decodeSingleChoice(
                formData.family_history_info?.ancestrial_lang,
                familyChoices.languages,
              ) || '';
            member['ancestral_language_other'] =
              formData.family_history_info?.ancestral_lang_oth || null;
            member['primary_mother_tongue'] =
              decodeSingleChoice(
                formData.family_history_info?.mother_tounge_primary,
                familyChoices.languages,
              ) || '';
            member['primary_mother_tongue_other'] =
              decodeSingleChoice(
                formData.family_history_info?.mother_tounge_primary_oth,
                familyChoices.languages,
              ) || null;
            member['religion'] =
              decodeSingleChoice(
                formData.family_history_info?.religion,
                familyChoices.religions,
              ) || '';
            member['religion_other'] =
              formData.family_history_info?.religion_other || null;
          } else if (individual.individual_history_info) {
            member['caste'] =
              decodeSingleChoice(
                individual.individual_history_info.caste_individual,
                familyChoices.castes,
              ) || '';
            member['caste_other'] =
              individual.individual_history_info.caste_oth_individual || null;
            member['ancestral_language'] =
              decodeSingleChoice(
                individual.individual_history_info.ancestrial_lang_individual,
                familyChoices.languages,
              ) || '';
            member['ancestral_language_other'] =
              individual.individual_history_info
                .ancestral_lang_oth_individual || null;
            member['primary_mother_tongue'] =
              decodeSingleChoice(
                individual.individual_history_info
                  .mother_tounge_primary_individual,
                familyChoices.languages,
              ) || '';
            member['primary_mother_tongue_other'] =
              decodeSingleChoice(
                individual.individual_history_info
                  .mother_tounge_primary_oth_individual,
                familyChoices.languages,
              ) || null;
            member['religion'] =
              decodeSingleChoice(
                individual.individual_history_info.religion_individual,
                familyChoices.religions,
              ) || '';
            member['religion_other'] =
              individual.individual_history_info.religion_other_individual ||
              null;
          }

          // Add marriage details if applicable
          if (individual.age >= 10 && individual.mrd) {
            member['marital_status'] =
              decodeSingleChoice(
                individual.mrd.marital_status,
                familyChoices.marital_status,
              ) || null;

            if (individual.mrd.marital_status !== '1') {
              // Not single
              member['married_age'] = individual.mrd.married_age || null;
            }
          }

          // Add health details if available
          const healthRecord = formData.health?.find(
            (h) =>
              h.health_name === individual.name &&
              parseInt(h.health_age, 10) === individual.age,
          );

          if (healthRecord) {
            member['has_chronic_disease'] =
              decodeSingleChoice(
                healthRecord.chronic?.has_chronic_disease,
                familyChoices.true_false,
              ) || null;
            member['primary_chronic_disease'] =
              healthRecord.chronic?.has_chronic_disease === 'yes'
                ? decodeSingleChoice(
                    healthRecord.chronic.primary_chronic_disease,
                    familyChoices.chronic_diseases,
                  )
                : null;

            member['is_sanitized'] =
              decodeSingleChoice(
                formData.id?.members?.is_sanitized,
                familyChoices.true_false,
              ) || null;
            member['is_disabled'] =
              decodeSingleChoice(
                healthRecord.is_disabled,
                familyChoices.true_false,
              ) || null;

            if (healthRecord.is_disabled === 'yes' && healthRecord.disability) {
              member['disability_type'] =
                decodeSingleChoice(
                  healthRecord.disability.dsbltp,
                  familyChoices.disability_types,
                ) || null;
              member['disability_cause'] =
                decodeSingleChoice(
                  healthRecord.disability.disability_cause,
                  familyChoices.disability_causes,
                ) || null;
            }
          }

          // Add fertility details if applicable
          const fertilityRecord = formData.fertility?.find(
            (f) =>
              f.fertility_name === individual.name &&
              parseInt(f.fertility_age || '0', 10) === individual.age,
          );

          if (fertilityRecord?.ftd) {
            member['gave_live_birth'] =
              decodeSingleChoice(
                fertilityRecord.ftd.gave_live_birth,
                familyChoices.true_false,
              ) || null;

            if (fertilityRecord.ftd.gave_live_birth === 'yes') {
              member['alive_sons'] = fertilityRecord.ftd.alive_sons || null;
              member['alive_daughters'] =
                fertilityRecord.ftd.alive_daughters || null;
              member['total_born_children'] =
                fertilityRecord.ftd.total_born_children || null;

              if (fertilityRecord.ftd.has_dead_children === 'yes') {
                member['dead_sons'] = fertilityRecord.ftd.dead_sons || null;
                member['dead_daughters'] =
                  fertilityRecord.ftd.dead_daughters || null;
              }

              if (fertilityRecord.ftd.frcb?.gave_recent_live_birth === 'yes') {
                member['recent_alive_sons'] =
                  fertilityRecord.ftd.frcb.recent_alive_sons || null;
                member['recent_alive_daughters'] =
                  fertilityRecord.ftd.frcb.recent_alive_daughters || null;
                member['recent_birth_total'] =
                  fertilityRecord.ftd.frcb.total_recent_children || null;
                member['recent_birth_location'] =
                  decodeSingleChoice(
                    fertilityRecord.ftd.frcb.recent_delivery_location,
                    familyChoices.delivery_locations,
                  ) || null;
                member['prenatal_checkup'] =
                  decodeSingleChoice(
                    fertilityRecord.ftd.frcb.prenatal_checkup,
                    familyChoices.true_false,
                  ) || null;
              }
            }
          }

          // Add education details if applicable
          const educationRecord = formData.education?.find(
            (e) =>
              e.edu_name === individual.name &&
              parseInt(e.edu_age, 10) === individual.age,
          );

          if (educationRecord?.edd) {
            member['literacy_status'] =
              decodeSingleChoice(
                educationRecord.edd.is_literate,
                familyChoices.literacy_status,
              ) || null;
            member['educational_level'] =
              decodeSingleChoice(
                educationRecord.edd.edu_level,
                familyChoices.educational_level,
              ) || null;
            member['goes_school'] =
              decodeSingleChoice(
                educationRecord.goes_school,
                familyChoices.true_false,
              ) || null;

            if (educationRecord.goes_school === 'no') {
              member['school_barrier'] =
                decodeSingleChoice(
                  educationRecord.school_barrier,
                  familyChoices.school_barriers,
                ) || null;
            }

            if (educationRecord.edt) {
              member['has_training'] =
                decodeSingleChoice(
                  educationRecord.edt.has_training,
                  familyChoices.true_false,
                ) || null;

              if (educationRecord.edt.has_training === 'yes') {
                member['primary_skill'] =
                  decodeSingleChoice(
                    educationRecord.edt.primary_skill,
                    familyChoices.skills,
                  ) || null;
              }
            }
          }

          // Add economy details if present
          const economyRecord = formData.economy?.find(
            (e) =>
              e.eco_name === individual.name &&
              parseInt(e.eco_age, 10) === individual.age,
          );

          if (economyRecord?.ed) {
            member['months_worked'] =
              decodeSingleChoice(
                economyRecord.ed.m_work,
                familyChoices.financial_work_duration,
              ) || null;
            member['primary_occupation'] =
              decodeSingleChoice(
                economyRecord.ed.primary_occu,
                familyChoices.occupations,
              ) || null;

            if (economyRecord.ed.EA02) {
              member['work_barrier'] =
                decodeSingleChoice(
                  economyRecord.ed.EA02.work_barrier,
                  familyChoices.work_barriers,
                ) || null;
              member['work_availability'] =
                decodeSingleChoice(
                  economyRecord.ed.EA02.work_availability,
                  familyChoices.work_availability,
                ) || null;
            }
          }

          // Initialize absentee fields
          member['is_absent'] = false;
          member['absence_reason'] = null;
          member['absence_location'] = null;
          member['absence_educational_level'] = null;
          member['absence_province'] = null;
          member['absence_district'] = null;
          member['absence_country'] = null;
          member['sends_remittance'] = false;
          member['remittance_amount'] = null;

          members.push(member);
        } catch (e) {
          const errorMessage = e instanceof Error ? e.message : 'Unknown error';
          this.logger.warn(
            `Error processing household member: ${errorMessage}`,
          );
        }
      }

      // Process absentees directly here and update corresponding household members
      if (
        formData.id.ewheres.are_ewhere === 'yes' &&
        formData.absentees &&
        Array.isArray(formData.absentees) &&
        formData.absentees.length > 0
      ) {
        for (const absentee of formData.absentees) {
          try {
            // Try to find matching individual in household_members
            const matchingMember = members.find(
              (member) =>
                member.name === absentee.abs_name &&
                member.gender ===
                  decodeSingleChoice(
                    absentee.abs_gender,
                    familyChoices.genders,
                  ) &&
                (absentee.abs_prior_age === member.age.toString() ||
                  parseInt(absentee.abs_prior_age || '0', 10) === member.age),
            );

            if (matchingMember) {
              // Update the household member with absentee information
              matchingMember.is_absent = true;
              matchingMember.absence_reason = decodeSingleChoice(
                absentee.abid.absence_reason,
                familyChoices.absence_reasons,
              );
              matchingMember.absence_location = decodeSingleChoice(
                absentee.abid.abl.abs_location,
                familyChoices.locations,
              );
              matchingMember.sends_remittance =
                absentee.abid.sent_cash === 'sent';
              matchingMember.remittance_amount =
                absentee.abid.sent_cash === 'sent'
                  ? absentee.abid.cash || null
                  : null;
              matchingMember.absence_educational_level = decodeSingleChoice(
                absentee.abid.abs_edulvl,
                familyChoices.educational_level,
              );

              // Add location details based on the absence location
              if (absentee.abid.abl.abs_location === 'another_district') {
                matchingMember.absence_province = decodeSingleChoice(
                  absentee.abid.abl.abs_province,
                  familyChoices.provinces,
                );
                matchingMember.absence_district = decodeSingleChoice(
                  absentee.abid.abl.abs_district,
                  familyChoices.districts,
                );
              } else if (absentee.abid.abl.abs_location === 'another_country') {
                matchingMember.absence_country = decodeSingleChoice(
                  absentee.abid.abl.abs_country,
                  familyChoices.countries,
                );
              }
            } else {
              // If no matching member is found, this might be an absentee not in the household
              // Create a new member record with absentee information
              const newMemberFromAbsentee = {
                id: `absent-mem-${Math.random().toString(36).substring(2, 10)}`,
                household_id: householdId,
                name: absentee.abs_name || '',
                gender:
                  decodeSingleChoice(
                    absentee.abs_gender,
                    familyChoices.genders,
                  ) || '',
                age: parseInt(absentee.abs_age || '0', 10) || 0,
                education_level:
                  decodeSingleChoice(
                    absentee.abs_edu_level,
                    familyChoices.educational_level,
                  ) || '',

                // Mark as an absentee
                is_absent: true,
                absence_reason:
                  decodeSingleChoice(
                    absentee.abid.absence_reason,
                    familyChoices.absence_reasons,
                  ) || '',
                absence_location:
                  decodeSingleChoice(
                    absentee.abs_location,
                    familyChoices.locations,
                  ) || '',
                absence_province: null,
                absence_district: null,
                absence_country: null,
                sends_remittance: absentee.abs_sends_remittance === 'yes',
                remittance_amount:
                  absentee.abs_sends_remittance === 'yes'
                    ? absentee.abs_remittance_amount || null
                    : null,
              };

              // Add location details based on the absence location
              if (absentee.abid.abl.abs_location === 'another_district') {
                newMemberFromAbsentee.absence_province = decodeSingleChoice(
                  absentee.abid.abl.abs_province,
                  familyChoices.provinces,
                );
                newMemberFromAbsentee.absence_district =
                  absentee.abid.abl.abs_district;
              } else if (absentee.abs_location === 'another_country') {
                newMemberFromAbsentee.absence_country = decodeSingleChoice(
                  absentee.abid.abl.abs_country,
                  familyChoices.countries,
                );
              }

              members.push(newMemberFromAbsentee);
            }
          } catch (e) {
            const errorMessage =
              e instanceof Error ? e.message : 'Unknown error';
            this.logger.warn(`Error processing absentee: ${errorMessage}`);
          }
        }
      }

      return members;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Error parsing household members: ${errorMessage}`);
      return [];
    }
  }

  /**
   * Parse agricultural lands from the family data
   */
  private parseAgriculturalLands(formData: any) {
    try {
      const lands = [];
      const householdId = formData.__id || '';
      const wardNumber = parseInt(formData.id?.ward_no || '0', 10) || 0;

      if (
        !formData.agri?.agricultural_land ||
        !Array.isArray(formData.agri.agricultural_land) ||
        formData.agri.agricultural_land.length === 0
      ) {
        return lands;
      }

      for (const land of formData.agri.agricultural_land) {
        try {
          lands.push({
            id:
              land.__id ||
              `land-${Math.random().toString(36).substring(2, 10)}`,
            household_id: householdId,
            ward_number: wardNumber,
            land_ownership_type: land.agland_oship || '',
            land_area:
              (land.land_area?.B02_3 || 0) * 6772.63 +
              (land.land_area?.B02_5 || 0) * 338.63 +
              (land.land_area?.B02_7 || 0) * 16.93,
            irrigation_source:
              decodeSingleChoice(
                land.irrigation_src,
                familyChoices.irrigation_source,
              ) || '',
            irrigation_time: decodeSingleChoice(
              land.irrigation_time,
              familyChoices.irrigation_time,
            ),
            irrigated_land_area:
              land.irrigation_src === 'no_irrigation'
                ? null
                : land.irrigation?.irrigated_area || null,
          });
        } catch (e) {
          const errorMessage = e instanceof Error ? e.message : 'Unknown error';
          this.logger.warn(
            `Error processing agricultural land: ${errorMessage}`,
          );
        }
      }

      return lands;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Error parsing agricultural lands: ${errorMessage}`);
      return [];
    }
  }

  /**
   * Parse crops from the family data
   */
  private parseCrops(formData: any) {
    try {
      const crops = [];
      const householdId = formData.__id || '';
      const wardNumber = parseInt(formData.id?.ward_no || '0', 10) || 0;

      if (!formData.agri?.food) {
        return crops;
      }

      // Process food crops
      if (formData.agri.food?.fcrop_details?.length > 0) {
        for (const crop of formData.agri.food.fcrop_details) {
          try {
            crops.push({
              id:
                crop.__id ||
                `crop-${Math.random().toString(36).substring(2, 10)}`,
              household_id: householdId,
              ward_number: wardNumber,
              crop_type: 'food',
              crop_name: crop.fcrop,
              area:
                (crop.fcrop_area_description?.fcrop_bigha || 0) * 6772.63 +
                (crop.fcrop_area_description?.fcrop_kattha || 0) * 338.63 +
                (crop.fcrop_area_description?.fcrop_dhur || 0) * 16.93,
              production: crop.fp?.fcrop_prod || '',
            });
          } catch (e) {
            const errorMessage =
              e instanceof Error ? e.message : 'Unknown error';
            this.logger.warn(`Error processing food crop: ${errorMessage}`);
          }
        }
      }

      // Process pulses
      if (formData.agri.food?.pulse_details?.length > 0) {
        for (const crop of formData.agri.food.pulse_details) {
          try {
            crops.push({
              id:
                crop.__id ||
                `crop-${Math.random().toString(36).substring(2, 10)}`,
              household_id: householdId,
              ward_number: wardNumber,
              crop_type: 'pulse',
              crop_name: crop.pulse || '',
              area:
                (crop.pulse_area_description?.pulse_bigha || 0) * 6772.63 +
                (crop.pulse_area_description?.pulse_kattha || 0) * 338.63 +
                (crop.pulse_area_description?.pulse_dhur || 0) * 16.93,
              production: crop.pp?.pulse_prod || '',
            });
          } catch (e) {
            const errorMessage =
              e instanceof Error ? e.message : 'Unknown error';
            this.logger.warn(`Error processing pulse crop: ${errorMessage}`);
          }
        }
      }

      // Process oil seeds
      if (formData.agri.food?.oseed_details?.length > 0) {
        for (const crop of formData.agri.food.oseed_details) {
          try {
            crops.push({
              id:
                crop.__id ||
                `crop-${Math.random().toString(36).substring(2, 10)}`,
              household_id: householdId,
              ward_number: wardNumber,
              crop_type: 'oilseed',
              crop_name: crop.oseed || '',
              area:
                (crop.oseed_area_description?.oseed_bigha || 0) * 6772.63 +
                (crop.oseed_area_description?.oseed_kattha || 0) * 338.63 +
                (crop.oseed_area_description?.oseed_dhur || 0) * 16.93,
              production: crop.oslp?.oseed_prod || '',
            });
          } catch (e) {
            const errorMessage =
              e instanceof Error ? e.message : 'Unknown error';
            this.logger.warn(`Error processing oilseed crop: ${errorMessage}`);
          }
        }
      }

      // Process vegetables
      if (formData.agri.food?.vtable_details?.length > 0) {
        for (const crop of formData.agri.food.vtable_details) {
          try {
            crops.push({
              id:
                crop.__id ||
                `crop-${Math.random().toString(36).substring(2, 10)}`,
              household_id: householdId,
              ward_number: wardNumber,
              crop_type: 'vegetable',
              crop_name: crop.vtable,
              area:
                (crop.vtables_area_description?.vtables_bigha || 0) * 6772.63 +
                (crop.vtables_area_description?.vtables_kattha || 0) * 338.63 +
                (crop.vtables_area_description?.vtables_dhur || 0) * 16.93,
              production: crop.vp?.vtable_prod || '',
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
      if (formData.agri.food?.fruit_details?.length > 0) {
        for (const crop of formData.agri.food.fruit_details) {
          try {
            crops.push({
              id:
                crop.__id ||
                `crop-${Math.random().toString(36).substring(2, 10)}`,
              household_id: householdId,
              ward_number: wardNumber,
              crop_type: 'fruit',
              crop_name: crop.fruit || '',
              area:
                (crop.fruits_area_description?.fruits_bigha || 0) * 6772.63 +
                (crop.fruits_area_description?.fruits_kattha || 0) * 338.63 +
                (crop.fruits_area_description?.fruits_dhur || 0) * 16.93,
              production: crop.frp?.fruit_prod || '',
              tree_count: crop?.fruits_trees_count || null,
            });
          } catch (e) {
            const errorMessage =
              e instanceof Error ? e.message : 'Unknown error';
            this.logger.warn(`Error processing fruit crop: ${errorMessage}`);
          }
        }
      }

      // Process spices
      if (formData.agri.food?.spice_details?.length > 0) {
        for (const crop of formData.agri.food.spice_details) {
          try {
            crops.push({
              id:
                crop.__id ||
                `crop-${Math.random().toString(36).substring(2, 10)}`,
              household_id: householdId,
              ward_number: wardNumber,
              crop_type: 'spice',
              crop_name: crop.spice || '',
              area:
                (crop.spice_area_description?.spice_bigha || 0) * 6772.63 +
                (crop.spice_area_description?.spice_kattha || 0) * 338.63 +
                (crop.spice_area_description?.spice_dhur || 0) * 16.93,
              production: crop.sp?.spice_prod || '',
            });
          } catch (e) {
            const errorMessage =
              e instanceof Error ? e.message : 'Unknown error';
            this.logger.warn(`Error processing spice crop: ${errorMessage}`);
          }
        }
      }

      // Process cash crops
      if (formData.agri.food?.ccrop_details?.length > 0) {
        for (const crop of formData.agri.food.ccrop_details) {
          try {
            crops.push({
              id:
                crop.__id ||
                `crop-${Math.random().toString(36).substring(2, 10)}`,
              household_id: householdId,
              ward_number: wardNumber,
              crop_type: 'cash',
              crop_name: crop.ccrop || '',
              area:
                (crop.ccrop_area_description?.ccrop_bigha || 0) * 6772.63 +
                (crop.ccrop_area_description?.ccrop_kattha || 0) * 338.63 +
                (crop.ccrop_area_description?.ccrop_dhur || 0) * 16.93,
              production: crop.cp?.ccrop_prod || '',
              tree_count: crop?.betel_tree_count,
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
   * Parse animals from the family data
   */
  private parseAnimals(formData: any) {
    try {
      const animals = [];
      const householdId = formData.__id || '';
      const wardNumber = parseInt(formData.id?.ward_no || '0', 10) || 0;

      if (
        !formData.agri?.animal_details ||
        !Array.isArray(formData.agri.animal_details) ||
        formData.agri.animal_details.length === 0
      ) {
        return animals;
      }

      for (const animal of formData.agri.animal_details) {
        try {
          const animalData = {
            id:
              animal.__id ||
              `animal-${Math.random().toString(36).substring(2, 10)}`,
            household_id: householdId,
            ward_number: wardNumber,
            animal_name: animal.animal || '',
            animal_name_other: null,
            total_animals: null,
            animal_sales: null,
            animal_revenue: null,
          };

          // Handle "other" animal types
          if (
            (animal.animal === 'अन्य पशु' || animal.animal === 'अन्य पन्छी') &&
            animal.anim
          ) {
            animalData.animal_name_other = animal.anim.animal_oth || null;
            animalData.total_animals = animal.anim.oth_total_animals || null;
            animalData.animal_sales = animal.anim.oth_animal_sales || null;
            animalData.animal_revenue = animal.anim.oth_animal_revenue || null;
          } else if (animal.animn) {
            animalData.total_animals = animal.animn.total_animals || null;
            animalData.animal_sales = animal.animn.animal_sales || null;
            animalData.animal_revenue = animal.animn.animal_revenue || null;
          }

          animals.push(animalData);
        } catch (e) {
          const errorMessage = e instanceof Error ? e.message : 'Unknown error';
          this.logger.warn(`Error processing animal: ${errorMessage}`);
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
   * Parse animal products from the family data
   */
  private parseAnimalProducts(formData: any) {
    try {
      const products = [];
      const householdId = formData.__id || '';
      const wardNumber = parseInt(formData.id?.ward_no || '0', 10) || 0;

      if (
        !formData.agri?.aprod_details ||
        !Array.isArray(formData.agri.aprod_details) ||
        formData.agri.aprod_details.length === 0
      ) {
        return products;
      }

      for (const product of formData.agri.aprod_details) {
        try {
          products.push({
            id:
              product.__id ||
              `product-${Math.random().toString(36).substring(2, 10)}`,
            household_id: householdId,
            ward_number: wardNumber,
            product_name: product.aprod || '',
            product_name_other: product.apo?.aprod_oth || null,
            unit: product.apon?.aprod_unit || '',
            unit_other: product.apon?.aprod_unit_oth || null,
            production: product.apon?.aprod_prod || 0,
          });
        } catch (e) {
          const errorMessage = e instanceof Error ? e.message : 'Unknown error';
          this.logger.warn(`Error processing animal product: ${errorMessage}`);
        }
      }

      return products;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Error parsing animal products: ${errorMessage}`);
      return [];
    }
  }

  /**
   * Parse deaths from the family data
   */
  private parseDeaths(formData: any) {
    try {
      const deaths = [];
      const householdId = formData.__id || '';
      const wardNumber = parseInt(formData.id?.ward_no || '0', 10) || 0;

      if (
        !formData.death?.dno?.death_details ||
        !Array.isArray(formData.death.dno.death_details) ||
        formData.death.dno.death_details.length === 0
      ) {
        return deaths;
      }

      for (const death of formData.death.dno.death_details) {
        try {
          deaths.push({
            id:
              death.__id ||
              `death-${Math.random().toString(36).substring(2, 10)}`,
            household_id: householdId,
            ward_number: wardNumber,
            deceased_name: death.death_name || '',
            deceased_gender:
              decodeSingleChoice(death.death_gender, familyChoices.genders) ||
              '',
            deceased_age: death.death_age || 0,
            deceased_death_cause:
              decodeSingleChoice(
                death.death_cause,
                familyChoices.death_causes,
              ) || '',
            deceased_fertility_death_condition:
              decodeSingleChoice(
                death.fertile_death_condition,
                familyChoices.fertile_death_conditions,
              ) || null,
          });
        } catch (e) {
          const errorMessage = e instanceof Error ? e.message : 'Unknown error';
          this.logger.warn(`Error processing death: ${errorMessage}`);
        }
      }

      return deaths;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Error parsing deaths: ${errorMessage}`);
      return [];
    }
  }
}
