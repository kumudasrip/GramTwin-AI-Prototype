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
  }
};

export function getVillageList() {
  return Object.values(villages).map(v => ({ id: v.id, name: v.name }));
}

export function getVillageBaseline(id: string): VillageBaseline | undefined {
  return villages[id];
}
