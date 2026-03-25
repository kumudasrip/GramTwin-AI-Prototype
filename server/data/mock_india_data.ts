export interface VillageBaseline {
  id: string;
  name: string;
  population: number;
  households: number;
  livestock: number;
  main_crop: string;
  groundwater_level: string;
  groundwater_level_initial: number;
  district: string;
  state: string;
}

export const villages: Record<string, VillageBaseline> = {
  "NARSING_BATLA": {
    id: "NARSING_BATLA",
    name: "Narsing Batla",
    population: 4236,
    households: 1070,
    livestock: 245,
    main_crop: "Paddy",
    groundwater_level: "Semi-Critical",
    groundwater_level_initial: 12.5,
    district: "Nizamabad",
    state: "Andhra Pradesh"
  },
  "TANDUR_VILLAGE": {
    id: "TANDUR_VILLAGE",
    name: "Tandur",
    population: 3850,
    households: 920,
    livestock: 180,
    main_crop: "Millet",
    groundwater_level: "Critical",
    groundwater_level_initial: 15.8,
    district: "Rangareddy",
    state: "Telangana"
  },
  "WARANGAL_RURAL": {
    id: "WARANGAL_RURAL",
    name: "Warangal Rural",
    population: 5120,
    households: 1280,
    livestock: 320,
    main_crop: "Paddy",
    groundwater_level: "Semi-Critical",
    groundwater_level_initial: 11.2,
    district: "Warangal",
    state: "Telangana"
  }
};

export function getVillageList() {
  return Object.values(villages).map(v => ({ id: v.id, name: v.name }));
}

export function getVillageBaseline(id: string): VillageBaseline | undefined {
  return villages[id];
}
