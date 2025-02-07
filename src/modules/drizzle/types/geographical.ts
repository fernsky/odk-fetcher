/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { sql } from 'drizzle-orm';
import { customType, type CustomTypeValues } from 'drizzle-orm/pg-core';
import type * as GeoJSON from 'geojson';
import * as wkx from 'wkx';

// PostGIS utility functions
export const postgis = {
  asGeoJSON: (column: string) => sql<string>`ST_AsGeoJSON(${sql.raw(column)})`,
  fromGeoJSON: (geojson: string) => sql`ST_GeomFromGeoJSON(${geojson})`,
  x: (column: string) => sql<number>`ST_X(${sql.raw(column)})`,
  y: (column: string) => sql<number>`ST_Y(${sql.raw(column)})`,
  centroid: (column: string) => sql`ST_Centroid(${sql.raw(column)})`,
  area: (column: string) => sql<number>`ST_Area(${sql.raw(column)})`,
  asText: (column: string) => sql<string>`ST_AsText(${sql.raw(column)})`,
  setSRID: (column: string, srid: number) =>
    sql`ST_SetSRID(${sql.raw(column)}, ${srid})`,
  transform: (column: string, srid: number) =>
    sql`ST_Transform(${sql.raw(column)}, ${srid})`,
};

/**
 * Custom type for PostGIS geometry that automatically converts to GeoJSON
 */
export const geometry = <
  TType extends GeoJSON.Geometry['type'] = GeoJSON.Geometry['type'],
  T extends CustomTypeValues = CustomTypeValues,
>(
  dbName: string,
  fieldConfig?: T['config'] & { type: TType },
) => {
  return customType<{
    data: GeometryTypes[TType];
  }>({
    dataType() {
      return fieldConfig?.type
        ? `geometry(${fieldConfig.type},4326)`
        : 'geometry';
    },
    toDriver(value) {
      if (!value) return sql`NULL`;
      return sql`ST_SetSRID(ST_GeomFromGeoJSON(${JSON.stringify(value)}), 4326)`;
    },
    fromDriver(value) {
      if (!value) return null;

      try {
        // If it's already a GeoJSON string
        if (typeof value === 'string' && value.startsWith('{')) {
          return JSON.parse(value) as GeometryTypes[TType];
        }

        // If it's a WKB hex string
        const buffer = Buffer.from(value as string, 'hex');
        const geometry = wkx.Geometry.parse(buffer);
        console.log(geometry.toGeoJSON());
        return geometry.toGeoJSON() as GeometryTypes[TType];
      } catch (error) {
        console.error('Error parsing geometry:', error);
        console.error('Raw value:', value);
        // Return as raw SQL for explicit conversion
        return sql`ST_AsGeoJSON(${sql.raw(value as string)})::json` as unknown as GeometryTypes[TType];
      }
    },
  })(dbName, fieldConfig);
};

// Helper types
export type Point = [number, number];
export type LineString = Point[];
export type Polygon = LineString[];

export type GeometryTypes = {
  Point: GeoJSON.Point;
  LineString: GeoJSON.LineString;
  Polygon: GeoJSON.Polygon;
  MultiPoint: GeoJSON.MultiPoint;
  MultiLineString: GeoJSON.MultiLineString;
  MultiPolygon: GeoJSON.MultiPolygon;
  GeometryCollection: GeoJSON.GeometryCollection;
};

// Example usage in schema:
// geometry: geometry('geometry', { type: 'Point' })
// geometry: geometry('geometry', { type: 'Polygon' })
