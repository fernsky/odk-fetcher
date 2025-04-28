-- V1: Initial schema creation for jobs and buddhashanti_aggregate_buildings

-- Create jobs table
CREATE TABLE jobs (
  id VARCHAR(48) PRIMARY KEY NOT NULL,
  type VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL,
  progress JSONB NOT NULL,
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  failed_at TIMESTAMP,
  error VARCHAR(1000),
  created_by VARCHAR(48),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

-- Create buddhashanti_aggregate_buildings table
CREATE TABLE buddhashanti_aggregate_buildings (
  id VARCHAR(48) PRIMARY KEY,
  building_id VARCHAR(48),
  building_survey_date TIMESTAMP,
  building_submission_date TIMESTAMP,
  enumerator_id VARCHAR(255),
  enumerator_name VARCHAR(255),
  enumerator_phone VARCHAR(50),
  ward_number INTEGER,
  area_code INTEGER,
  locality VARCHAR(255),
  building_token VARCHAR(255),
  building_owner_name VARCHAR(255),
  building_owner_phone VARCHAR(50),
  total_families INTEGER,
  total_businesses INTEGER,
  building_gps_latitude DECIMAL(10, 6),
  building_gps_longitude DECIMAL(10, 6),
  building_gps_altitude DECIMAL(10, 2),
  building_gps_accuracy DECIMAL(10, 2),
  building_ownership_status VARCHAR(100),
  building_ownership_status_other TEXT,
  building_base VARCHAR(100),
  building_base_other TEXT,
  building_outer_wall VARCHAR(100),
  building_outer_wall_other TEXT,
  building_roof VARCHAR(100),
  building_roof_other TEXT,
  natural_disasters TEXT[],
  natural_disasters_other TEXT,
  building_image_key VARCHAR(255),
  building_enumerator_selfie_key VARCHAR(255),
  building_audio_recording_key VARCHAR(255),
  households JSONB,
  businesses JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

-- Add indexes for better query performance
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_buddhashanti_buildings_ward ON buddhashanti_aggregate_buildings(ward_number);
CREATE INDEX idx_buddhashanti_buildings_locality ON buddhashanti_aggregate_buildings(locality);