import { RawFamily } from './types';
import { sql } from 'drizzle-orm';
import { jsonToPostgres, decodeSingleChoice } from '@app/common/utils/data';
import { familyChoices } from '../../resources/family';

export async function parseIndividuals(r: RawFamily, ctx: any) {
  const areaAFamily = r.id.members.are_a_family == 'yes';

  if (r.individual && r.individual.length > 0) {
    for (const i of r.individual) {
      // Initialize base individual object with primary keys and basic info
      const individual = {
        id: i.__id,
        family_id: r.__id,
        ward_no: r.id.ward_no,

        // Personal Information
        name: i.name,
        gender: decodeSingleChoice(i.gender, familyChoices.genders),
        age: i.age,
        // Cultural and Demographic Information
        citizen_of: decodeSingleChoice(
          i.citizenof,
          familyChoices.local_countries,
        ),
        citizen_of_other: i.citizenof_oth,
        caste: decodeSingleChoice(
          areaAFamily
            ? r.family_history_info.caste
            : i.individual_history_info.caste_individual,
          familyChoices.castes,
        ),
        caste_other: areaAFamily
          ? r.family_history_info.caste_oth
          : i.individual_history_info.caste_oth_individual,
        ancestor_language: decodeSingleChoice(
          areaAFamily
            ? r.family_history_info.ancestrial_lang
            : i.individual_history_info.ancestrial_lang_individual,
          familyChoices.languages,
        ),
        ancestor_language_other: areaAFamily
          ? r.family_history_info.ancestrial_lang_oth
          : i.individual_history_info.ancestrial_lang_oth_individual,
        primary_mother_tongue: decodeSingleChoice(
          areaAFamily
            ? r.family_history_info.mother_tounge_primary
            : i.individual_history_info.mother_tounge_primary_individual,
          familyChoices.languages,
        ),
        primary_mother_tongue_other: areaAFamily
          ? r.family_history_info.mother_tounge_primary_oth
          : i.individual_history_info.mother_tounge_primary_oth_individual,
        religion: decodeSingleChoice(
          areaAFamily
            ? r.family_history_info.religion
            : i.individual_history_info.religion_individual,
          familyChoices.religions,
        ),
        religion_other: areaAFamily
          ? r.family_history_info.religion_other
          : i.individual_history_info.religion_other_individual,

        // Marital Status
        marital_status: null as string | null,
        married_age: null as number | null,

        // Health Information
        has_chronic_disease: null as string | null,
        primary_chronic_disease: null as string | null,
        is_sanitized: null as string | null,

        // Disability Information
        is_disabled: null as string | null,
        disability_type: null as string | null,
        disability_type_other: null as string | null,
        disability_cause: null as string | null,

        // Documents
        has_birth_certificate: null as string | null,

        // Fertility and Birth Information
        gave_live_birth: null as string | null,
        alive_sons: null as number | null,
        alive_daughters: null as number | null,
        total_born_children: null as number | null,
        has_dead_children: null as string | null,
        dead_sons: null as number | null,
        dead_daughters: null as number | null,
        total_dead_children: null as number | null,

        // Recent Birth Details
        gave_recent_live_birth: null as string | null,
        recent_born_sons: null as number | null,
        recent_born_daughters: null as number | null,
        total_recent_children: null as number | null,
        recent_delivery_location: null as string | null,
        prenatal_checkups: null as number | null,
        first_delivery_age: null as number | null,

        // Presence and Migration Status (default to present)
        is_present: 'yes' as string,
        absentee_age: null as number | null,
        absentee_educational_level: null as string | null,
        absence_reason: null as string | null,
        absentee_location: null as string | null,
        absentee_province: null as string | null,
        absentee_district: null as string | null,
        absentee_country: null as string | null,
        absentee_has_sent_cash: null as string | null,
        absentee_cash_amount: null as number | null,

        // Education Information
        literacy_status: null as string | null,
        school_presence_status: null as string | null,
        educational_level: null as string | null,
        primary_subject: null as string | null,
        goes_school: null as string | null,
        school_barrier: null as string | null,

        // Training and Skills
        has_training: null as string | null,
        training: null as string | null,
        months_trained: null as number | null,
        primary_skill: null as string | null,
        has_internet_access: null as string | null,

        // Occupation and Work
        financial_work_duration: null as string | null,
        primary_occupation: null as string | null,
        work_barrier: null as string | null,
        work_availability: null as string | null,
      };

      // Process Birth Certificate from five_below data
      if (i.five_below?.birth_certification) {
        individual.has_birth_certificate = decodeSingleChoice(
          i.five_below.birth_certification,
          familyChoices.true_false,
        );
      }

      // Process Marital Status
      if (i.age >= 10 && i.mrd) {
        individual.marital_status = decodeSingleChoice(
          i.mrd.marital_status,
          familyChoices.marital_status,
        );
        if (
          i.mrd.marital_status !== '1' &&
          i.mrd.marital_status !== 'unmarried'
        ) {
          individual.married_age = i.mrd.married_age;
        }
      }

      // Process Health and Disability Information
      if (r.health?.length > 0) {
        const healthRecord = r.health.find(
          (j) => i.name === j.health_name && i.age === parseInt(j.health_age),
        );
        if (healthRecord) {
          individual.has_chronic_disease = decodeSingleChoice(
            healthRecord.chronic.has_chronic_disease,
            familyChoices.true_false,
          );
          if (healthRecord.chronic.has_chronic_disease === 'yes') {
            individual.primary_chronic_disease = decodeSingleChoice(
              healthRecord.chronic.primary_chronic_disease,
              familyChoices.chronic_diseases,
            );
          }
          individual.is_sanitized = decodeSingleChoice(
            r.id.members.is_sanitized,
            familyChoices.true_false,
          );
          individual.is_disabled = decodeSingleChoice(
            healthRecord.is_disabled,
            familyChoices.true_false,
          );
          if (healthRecord.is_disabled === 'yes') {
            individual.disability_type = decodeSingleChoice(
              healthRecord.disability.dsbltp,
              familyChoices.disability_types,
            );
            individual.disability_type_other =
              healthRecord.disability.other_disability_type || null;
            individual.disability_cause = decodeSingleChoice(
              healthRecord.disability.disability_cause,
              familyChoices.disability_causes,
            );
          }
        }
      }

      // Process Fertility and Birth Information
      if (r.fertility?.length > 0) {
        const fertilityRecord = r.fertility.find(
          (j) =>
            i.name === j.fertility_name && i.age === parseInt(j.fertility_age),
        );
        if (fertilityRecord?.ftd) {
          individual.gave_live_birth = decodeSingleChoice(
            fertilityRecord.ftd.gave_live_birth,
            familyChoices.true_false,
          );
          if (fertilityRecord.ftd.gave_live_birth === 'yes') {
            individual.alive_sons = fertilityRecord.ftd.alive_sons;
            individual.alive_daughters = fertilityRecord.ftd.alive_daughters;
            individual.total_born_children =
              parseInt(
                fertilityRecord.ftd.total_born_children?.toString() || '0',
                10,
              ) || null;
            individual.first_delivery_age = fertilityRecord.ftd.delivery_age;
          }

          // Handle deceased children
          individual.has_dead_children = decodeSingleChoice(
            fertilityRecord.ftd.has_dead_children,
            familyChoices.true_false,
          );
          if (fertilityRecord.ftd.has_dead_children === 'yes') {
            individual.dead_sons = fertilityRecord.ftd.dead_sons;
            individual.dead_daughters = fertilityRecord.ftd.dead_daughters;
            individual.total_dead_children =
              parseInt(
                fertilityRecord.ftd.total_dead_children?.toString() || '0',
                10,
              ) || null;
          }

          // Handle recent births
          individual.gave_recent_live_birth = decodeSingleChoice(
            fertilityRecord.ftd.frcb?.gave_recent_live_birth,
            familyChoices.true_false,
          );
          if (fertilityRecord.ftd.frcb?.gave_recent_live_birth === 'yes') {
            individual.recent_born_sons =
              fertilityRecord.ftd.frcb.recent_alive_sons;
            individual.recent_born_daughters =
              fertilityRecord.ftd.frcb.recent_alive_daughters;
            individual.total_recent_children =
              fertilityRecord.ftd.frcb.total_recent_children;
            individual.recent_delivery_location = decodeSingleChoice(
              fertilityRecord.ftd.frcb.recent_delivery_location,
              familyChoices.delivery_locations,
            );
            individual.prenatal_checkups =
              fertilityRecord.ftd.frcb.prenatal_checkup === 'yes' ? 1 : 0;
          }
        }
      }

      // Process Education, Training and Skills Information
      if (r.education?.length > 0) {
        const educationRecord = r.education.find(
          (j) => j.edu_name === i.name && parseInt(j.edu_age) === i.age,
        );
        if (educationRecord) {
          individual.literacy_status = decodeSingleChoice(
            educationRecord.edd.is_literate,
            familyChoices.literacy_status,
          );
          individual.educational_level = decodeSingleChoice(
            educationRecord.edd.edu_level,
            familyChoices.educational_level,
          );
          individual.primary_subject = decodeSingleChoice(
            educationRecord.edd.primary_sub,
            familyChoices.subjects,
          );
          individual.goes_school = decodeSingleChoice(
            educationRecord.goes_school,
            familyChoices.true_false,
          );
          individual.school_presence_status = individual.goes_school;

          // Add education training details
          if (educationRecord.edt) {
            individual.has_training = decodeSingleChoice(
              educationRecord.edt.has_training,
              familyChoices.true_false,
            );
            if (educationRecord.edt.has_training === 'yes') {
              individual.primary_skill = decodeSingleChoice(
                educationRecord.edt.primary_skill,
                familyChoices.skills,
              );
            }
          }

          // Add school barrier if applicable
          if (educationRecord.goes_school === 'no') {
            individual.school_barrier = decodeSingleChoice(
              educationRecord.school_barrier,
              familyChoices.school_barriers,
            );
          }
        }
      }

      // Process Occupation and Work Information
      if (r.economy?.length > 0) {
        const economyRecord = r.economy.find(
          (j) => j.eco_name === i.name && parseInt(j.eco_age) === i.age,
        );
        if (economyRecord?.ed) {
          individual.financial_work_duration = decodeSingleChoice(
            economyRecord.ed.m_work,
            familyChoices.financial_work_duration,
          );
          individual.primary_occupation = decodeSingleChoice(
            economyRecord.ed.primary_occu,
            familyChoices.occupations,
          );
          if (economyRecord.ed.EA02) {
            individual.work_barrier = decodeSingleChoice(
              economyRecord.ed.EA02.work_barrier,
              familyChoices.work_barriers,
            );
            individual.work_availability = decodeSingleChoice(
              economyRecord.ed.EA02.work_availability,
              familyChoices.work_availability,
            );
          }
        }
      }

      // Process absentee information - check if this person is actually absent
      if (r.id?.ewheres?.are_ewhere === 'yes' && r.absentees?.length > 0) {
        const absenteeRecord = r.absentees.find(
          (abs) =>
            abs.abs_name === i.name &&
            abs.abs_gender === i.gender &&
            parseInt(abs.abs_prior_age || '0', 10) === i.age &&
            abs.abid.abs_age !== null, // Only include actual absentees
        );

        if (absenteeRecord && absenteeRecord.abid.abs_age !== null) {
          individual.is_present = 'no';
          individual.absentee_age = absenteeRecord.abid.abs_age;
          individual.absentee_educational_level = decodeSingleChoice(
            absenteeRecord.abid.abs_edulvl,
            familyChoices.educational_level,
          );
          individual.absence_reason = decodeSingleChoice(
            absenteeRecord.abid.absence_reason,
            familyChoices.absence_reasons,
          );
          individual.absentee_location = decodeSingleChoice(
            absenteeRecord.abid.abl.abs_location,
            familyChoices.locations,
          );

          if (absenteeRecord.abid.abl.abs_location === 'another_district') {
            individual.absentee_province = decodeSingleChoice(
              absenteeRecord.abid.abl.abs_province,
              familyChoices.provinces,
            );
            individual.absentee_district = decodeSingleChoice(
              absenteeRecord.abid.abl.abs_district,
              familyChoices.districts,
            );
          } else if (
            absenteeRecord.abid.abl.abs_location === 'another_country'
          ) {
            individual.absentee_country = decodeSingleChoice(
              absenteeRecord.abid.abl.abs_country,
              familyChoices.countries,
            );
          }

          individual.absentee_has_sent_cash = decodeSingleChoice(
            absenteeRecord.abid.sent_cash,
            familyChoices.true_false,
          );
          individual.absentee_cash_amount =
            absenteeRecord.abid.sent_cash === 'sent'
              ? absenteeRecord.abid.cash
              : null;
        }
      }

      // Database Operations
      try {
        const individualStatement = jsonToPostgres(
          'staging_lungri_individual',
          individual,
        );
        if (individualStatement) {
          await ctx.db.execute(sql.raw(individualStatement));
        }
      } catch (error) {
        console.error(`Error inserting individual ${i.name}:`, error);
      }
    }
  }
}
