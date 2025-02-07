import { AreaStatus } from '@app/modules/area/types/area.types';
export const areaSeeds = [
  {
    id: '1',
    code: 1001,
    wardNumber: 1,
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [83.27, 27.68],
          [83.28, 27.68],
          [83.28, 27.67],
          [83.27, 27.67],
          [83.27, 27.68],
        ],
      ],
    },
    areaStatus: AreaStatus.UNASSIGNED,
    assignedTo: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    code: 2001,
    wardNumber: 2,
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [83.29, 27.69],
          [83.3, 27.69],
          [83.3, 27.68],
          [83.29, 27.68],
          [83.29, 27.69],
        ],
      ],
    },
    areaStatus: AreaStatus.UNASSIGNED,
    assignedTo: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
