import { AreaStatus } from '../types/area.types';
import { Geometry } from '../types/area.types';

export interface IArea {
  id: string;
  code: number;
  wardNumber: number;
  geometry: Geometry;
  areaStatus: AreaStatus;
  assignedTo: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAreaResponse extends IArea {
  centroid?: Geometry;
}
