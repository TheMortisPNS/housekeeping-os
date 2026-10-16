export const DORM_ROOMS: Record<string, string[]> = {
  '12': ['A', 'B', 'C', 'D', 'E', 'F'],
  '13': ['A', 'B', 'C', 'D'],
  '23': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
  '24': ['A', 'B', 'C', 'D'],
  '33': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
  '34': ['A', 'B', 'C', 'D'],
  '43': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
  '44': ['A', 'B', 'C', 'D'],
  '51': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
};

export const PRIVATE_ROOMS = ['11', '21', '22', '31', '32', '41', '42', '50', '14'];

export const HOUSES = [
  'AKROPOLI',
  'VEIKOU',
  'ERMOU 1',
  'ERMOU 2',
  'ERMOU 3',
  'SOKRATOUS',
  'PETRATOS A4',
  'PETRATOS A3',
  'MILTIADOU',
  'VASO',
  'LOFT',
  'K44',
  'TRIGONO',
  'MAKRYGIANNI',
];
export const STATUS_CYCLE = ['empty', 'IN', 'OUT'] as const;
export type BedStatus = typeof STATUS_CYCLE[number];
