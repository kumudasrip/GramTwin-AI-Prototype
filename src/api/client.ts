export interface BaselineData {
  village_id?: string;
  village_name?: string;
  state?: string;
  district?: string;
  population: number;
  households: number;
  livestock: number;
  main_crop: string;
  groundwater_level: string;
}

export interface MonthRisk {
  month: string;
  risk: "Low" | "Medium" | "High";
  water_stock?: number;
}

export interface CropRecommendation {
  crop: string;
  suitability: string;
  reason: string;
}

export interface SimulationResult {
  timeline: MonthRisk[];
  crop_recommendations: CropRecommendation[];
  alerts: string[];
  water_stock_per_month?: number[];
  rainfall_info?: {
    avg_rainfall_mm: number;
    rainfall_category: string;
  };
}

export interface VillageListItem {
  id: string;
  name: string;
}

export const fetchVillageList = async (): Promise<VillageListItem[]> => {
  const res = await fetch("/api/village/list");
  return res.json();
};

export const fetchVillageBaseline = async (id: string): Promise<BaselineData> => {
  const res = await fetch(`/api/village/${id}/baseline`);
  return res.json();
};

export const fetchBaseline = async (): Promise<BaselineData> => {
  const res = await fetch("/api/village/baseline");
  return res.json();
};

export const fetchLastSimulation = async (): Promise<SimulationResult | null> => {
  const res = await fetch("/api/village/last_simulation");
  if (res.ok) return res.json();
  return null;
};

export const fetchRainfallInfo = async (id: string): Promise<{ avg_rainfall_mm: number; rainfall_category: string }> => {
  const res = await fetch(`/api/rainfall/${id}`);
  return res.json();
};

export const fetchVillageBoundaries = async (): Promise<any> => {
  const res = await fetch("/api/geo/villages");
  return res.json();
};

export const fetchVillageFields = async (id: string): Promise<any> => {
  const res = await fetch(`/api/geo/village/${id}/fields`);
  return res.json();
};

export const fetchVillageWells = async (id: string): Promise<any> => {
  const res = await fetch(`/api/geo/village/${id}/wells`);
  return res.json();
};

export const fetchVillageFloodRisk = async (id: string): Promise<any> => {
  const res = await fetch(`/api/geo/village/${id}/flood_risk`);
  return res.json();
};

export const runSimulation = async (data: {
  village_id: string;
  population: number;
  rainfall_forecast?: string;
  groundwater_level: string;
  current_crop: string;
}): Promise<SimulationResult> => {
  const res = await fetch("/api/village/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const fetchAlerts = async (): Promise<string[]> => {
  const res = await fetch("/api/village/alerts");
  return res.json();
};
