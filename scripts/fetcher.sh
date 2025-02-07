#!/bin/bash

# Create log directories if they don't exist
LOG_DIR="/var/log/odk-fetcher"
mkdir -p "$LOG_DIR/kerabari"
mkdir -p "$LOG_DIR/buddhashanti"

# Get dates
START_DATE=$(date -d "yesterday" +%Y-%m-%d)
END_DATE=$(date -d "tomorrow" +%Y-%m-%d)
CURRENT_TIME=$(date '+%Y-%m-%d_%H-%M-%S')

# Function to fetch submissions
fetch_submissions() {
    local municipality=$1
    local form_id=$2
    local log_file="$LOG_DIR/${municipality}/${form_id}_${CURRENT_TIME}.log"

    echo "Fetching $form_id for $municipality at $(date)" >> "$log_file"
    
    response=$(curl -s -X POST \
        "https://odk-fetcher.intensivestudy.com.np/v1/odk/${municipality}/fetch-submissions" \
        -H "Content-Type: application/json" \
        -d "{
            \"id\": \"${form_id}\",
            \"startDate\": \"${START_DATE}\",
            \"endDate\": \"${END_DATE}\",
            \"count\": 1000
        }")
    
    echo "Response: $response" >> "$log_file"
    echo "Completed at $(date)" >> "$log_file"
    echo "----------------------------------------" >> "$log_file"
}

# Fetch Kerabari submissions
fetch_submissions "kerabari" "kerabari_family_survey"
fetch_submissions "kerabari" "kerabari_building_survey"

# Fetch Buddhashanti submissions
fetch_submissions "buddhashanti" "buddhashanti_family_survey"
fetch_submissions "buddhashanti" "buddhashanti_building_survey"

# Cleanup old logs (keep last 30 days)
find "$LOG_DIR" -type f -name "*.log" -mtime +30 -delete
