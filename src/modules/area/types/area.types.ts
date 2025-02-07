export enum AreaStatus {
  ASSIGNED = 'assigned',
  UNASSIGNED = 'unassigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export interface Geometry {
  type: string;
  coordinates: number[][][];
}

export interface Area {
  id: string;
  code: number;
  wardNumber: number;
  geometry: Geometry;
  areaStatus: AreaStatus;
  assignedTo: string | null;
  createdAt: Date;
  updatedAt: Date;
}
