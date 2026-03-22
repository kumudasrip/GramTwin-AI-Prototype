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
  "Village_A": {
    id: "Village_A",
    name: "Anantapur Rural",
    population: 4500,
    households: 1000,
    livestock: 800,
    main_crop: "Paddy",
    groundwater_level: "Declining",
    groundwater_level_initial: 25.0,
    district: "Anantapur",
    state: "Andhra Pradesh"
  },
  "Village_B": {
    id: "Village_B",
    name: "Baramati North",
    population: 3200,
    households: 750,
    livestock: 1200,
    main_crop: "Millets",
    groundwater_level: "Stable",
    groundwater_level_initial: 45.0,
    district: "Pune",
    state: "Maharashtra"
  },
  "Village_C": {
    id: "Village_C",
    name: "Chittoor East",
    population: 5800,
    households: 1300,
    livestock: 600,
    main_crop: "Pulses",
    groundwater_level: "Critical",
    groundwater_level_initial: 15.0,
    district: "Chittoor",
    state: "Andhra Pradesh"
  }
};

export function getVillageList() {
  return Object.values(villages).map(v => ({ id: v.id, name: v.name }));
}

export function getVillageBaseline(id: string): VillageBaseline | undefined {
  return villages[id];
}
