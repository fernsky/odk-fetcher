// Define types for the nested structures to ensure type safety
export type HouseholdData = {
  household_survey_date: string;
  household_submission_date: string;
  household_gps_latitude: number;
  household_gps_longitude: number;
  household_gps_altitude: number;
  household_gps_accuracy: number;
  household_locality: string;
  household_development_organization: string;
  household_image_key?: string;
  household_enumerator_selfie_key?: string;
  household_audio_recording_key?: string;
};
