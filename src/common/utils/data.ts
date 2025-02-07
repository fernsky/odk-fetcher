export function getValueFromNestedField(data: any, fieldPath: string): any {
  return fieldPath.split('.').reduce((acc, part) => {
    if (acc === undefined || acc === null) return undefined;

    const arrayIndexMatch = part.match(/(\w+)\[(\d+)\]/);
    if (arrayIndexMatch) {
      const [, property, index] = arrayIndexMatch;
      return acc[property][parseInt(index, 10)];
    }
    return acc[part];
  }, data);
}

/**
 * Represents a GeoJSON-like point location structure from ODK
 */
interface GeoPointLocation {
  type: 'Point';
  coordinates: [number, number, number]; // [longitude, latitude, altitude]
  properties: {
    accuracy: number; // GPS accuracy in meters
  };
}

/**
 * Structure for processed GPS data
 */
interface ProcessedGPSData {
  gps: string | null;
  altitude: number | null;
  gpsAccuracy: number | null;
}

/**
 * Processes location data from different formats into a standardized GPS structure
 *
 * @param location - Location data either as WKT POINT string or GeoJSON object
 * @returns Processed GPS data with standardized format
 */
export function processGPSData(
  location: string | GeoPointLocation | null,
): ProcessedGPSData {
  const result: ProcessedGPSData = {
    gps: null,
    altitude: null,
    gpsAccuracy: null,
  };

  if (!location) return result;

  if (typeof location === 'string') {
    // Parse WKT POINT string format: "POINT (longitude latitude altitude)"
    const matches = location.match(/POINT \(([^ ]+) ([^ ]+) ([^ ]+)\)/);
    if (matches) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, longitude, latitude, alt] = matches;
      result.gps = `POINT(${longitude} ${latitude})`; // Convert to PostGIS format
      result.altitude = parseFloat(alt);
    }
  } else if (typeof location === 'object') {
    // Handle GeoJSON-like object format from ODK
    const { coordinates, properties } = location;
    if (coordinates && coordinates.length >= 3) {
      const [longitude, latitude, alt] = coordinates;
      result.gps = `POINT(${longitude} ${latitude})`; // Convert to PostGIS format
      result.altitude = alt;
      result.gpsAccuracy = properties?.accuracy;
    }
  }

  return result;
}

interface TableData {
  [key: string]: any;
}

/**
 * Converts a JavaScript object into a PostgreSQL INSERT statement with UPSERT functionality
 *
 * @param table - The name of the target PostgreSQL table
 * @param data - Object containing key-value pairs representing table columns and their values
 *
 * @returns A SQL string containing the INSERT statement with ON CONFLICT handling
 *
 * @remarks
 * - Handles special case for POINT geometry data by using ST_GeomFromText
 * - Escapes single quotes in string values
 * - Converts null values to 'NULL'
 * - Creates UPSERT statement using ON CONFLICT DO UPDATE
 * - Uses 'id' as the conflict target column
 *
 * @example
 * ```typescript
 * const data = {
 *   id: 1,
 *   name: "John's Data",
 *   location: "POINT(10 20)",
 *   age: 25
 * };
 * const sql = jsonToPostgres("users", data);
 * // Returns: INSERT INTO users (id,name,location,age)
 * //          VALUES (1,'John''s Data',ST_GeomFromText('POINT(10 20)', 4326),25)
 * //          ON CONFLICT (id) DO UPDATE SET id = EXCLUDED.id, ...
 * ```
 */
export const jsonToPostgres = (
  table: string,
  data: TableData,
  conflictClause: string = 'ON CONFLICT(id)',
): string => {
  const keys = Object.keys(data);

  const values = Object.values(data).map((val) => {
    if (val === null || val === undefined) return 'NULL';

    if (Array.isArray(val)) {
      const escapedValues = val
        .filter((item) => item !== undefined && item !== null)
        .map((item) =>
          typeof item === 'string' ? `'${item.replace(/'/g, "''")}'` : item,
        );
      return `ARRAY[${escapedValues.join(',')}]`;
    }

    if (typeof val === 'string') {
      if (val.startsWith('POINT')) {
        return `ST_GeomFromText('${val}', 4326)`;
      }
      /*
      if (val.startsWith("uuid:")) {
        return `'${val.substring(5)}'::UUID`;
      }
        */
      return `'${val.replace(/'/g, "''")}'`;
    }

    return val;
  });

  const conflictUpdateClause = keys
    .map((key) => `${key} = EXCLUDED.${key}`)
    .join(', ');

  return `
        INSERT INTO ${table} (${keys.join(',')}) 
        VALUES (${values.join(',')})
        ${conflictClause}
        DO UPDATE SET ${conflictUpdateClause}
    `;
};

export const isValidGeoJSON = (geojson: any): boolean => {
  if (!geojson || typeof geojson !== 'object') return false;

  // Check if it's a proper GeoJSON object
  if (!geojson.type || !geojson.coordinates) return false;

  // Basic coordinate validation
  const validateCoords = (coords: any[]): boolean => {
    if (!Array.isArray(coords)) return false;

    for (const coord of coords) {
      if (Array.isArray(coord)) {
        if (!validateCoords(coord)) return false;
      } else {
        if (typeof coord !== 'number' || isNaN(coord)) return false;
      }
    }
    return true;
  };

  return validateCoords(geojson.coordinates);
};

// Decode the single choice questions that are in the form
// as like
// What is the type of your house?
// 1 : Private
// 2 : Public

export const decodeSingleChoice = <T extends Record<string, string>>(
  value: any,
  choices: T,
): string => {
  try {
    return choices[value];
  } catch (e) {
    return value as string;
  }
};

// Decode multiple choice questions like
// Select which which facilites do you have?
// '1 2 3' to be decoded to ["Radio", "Television", "Computer"]

export const decodeMultipleChoices = <T extends Record<string, string>>(
  value: string,
  choices: T,
): string[] | undefined => {
  try {
    if (!value) return undefined;
    const splitUserChoices = value.split(' ');
    const mappedUserChoices = splitUserChoices.map((choice) =>
      decodeSingleChoice(choice as keyof T, choices),
    );
    return mappedUserChoices;
  } catch (e) {
    console.log(value, choices, e);
    return undefined;
  }
};
