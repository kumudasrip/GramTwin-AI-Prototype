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

// ===== New API Functions for Reports and Infrastructure =====

export interface VillageReport {
  id: string;
  villageId: string;
  reportDate: string;
  submittedBy: string;
  submitterType: "Panchayat" | "NGO" | "Government";
  waterStatus: "Excellent" | "Good" | "Moderate" | "Poor" | "Critical";
  waterDetails: string;
  climateStatus: "Excellent" | "Good" | "Moderate" | "Challenging" | "Critical";
  climateDetails: string;
  currentChallenges: string[];
  notes: string;
}

export interface VillageMetadata {
  villageId: string;
  villageName: string;
  soilComposition: {
    soilType: string;
    percentage: number;
    coordinates?: { lat: number; lng: number }[];
  }[];
  suitableCrops: any[];
  currentWaterStatus: string;
  currentClimateStatus: string;
  infrastructureNeeds: string[];
}

export interface InfrastructureRecommendation {
  id: string;
  villageId: string;
  type: string;
  priority: "High" | "Medium" | "Low";
  description: string;
  estimatedCost?: string;
  implementation?: string;
  source: "Photo" | "Map" | "Report";
  relatedAsset?: string;
  statusCondition?: string;
}

// Fetch village metadata with soil types and crop information
export const fetchVillageMetadata = async (villageId: string): Promise<VillageMetadata> => {
  const res = await fetch(`/api/village/${villageId}/metadata`);
  return res.json();
};

// Get all reports for a village
export const fetchVillageReports = async (villageId: string): Promise<VillageReport[]> => {
  const res = await fetch(`/api/village/${villageId}/reports`);
  return res.json();
};

// Get latest report for a village
export const fetchLatestReport = async (villageId: string): Promise<VillageReport | null> => {
  const res = await fetch(`/api/village/${villageId}/reports/latest`);
  if (res.ok) return res.json();
  return null;
};

// Submit a new report
export const submitVillageReport = async (report: Omit<VillageReport, 'id' | 'reportDate'>): Promise<VillageReport> => {
  const res = await fetch("/api/village/report/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(report),
  });
  return res.json();
};

// Get infrastructure recommendations for a village
export const fetchInfrastructureRecommendations = async (villageId: string): Promise<InfrastructureRecommendation[]> => {
  const res = await fetch(`/api/village/${villageId}/infrastructure/recommendations`);
  return res.json();
};

// Generate recommendations based on photo analysis (mock implementation)
export const uploadDumpyardPhoto = async (villageId: string, file: File): Promise<InfrastructureRecommendation[]> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('villageId', villageId);
  
  const res = await fetch("/api/village/infrastructure/analyze-photo", {
    method: "POST",
    body: formData,
  });
  return res.json();
};

// Search for villages by name
export const searchVillages = async (query: string): Promise<VillageListItem[]> => {
  const res = await fetch(`/api/village/search?q=${encodeURIComponent(query)}`);
  return res.json();
};

// Get soil data for a village
export interface SoilData {
  region: string;
  soilType: string;
  coordinates: [number, number];
  crops: string[];
  pH: number;
  fertility: 'Low' | 'Medium' | 'High';
  waterRetention: 'Low' | 'Medium' | 'High';
  organicMatter?: number;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
}

export interface SoilDataResponse {
  villageId: string;
  soilZones: SoilData[];
  totalZones: number;
  averageFertility: number;
  lastUpdated: string;
}

export const fetchSoilData = async (villageId: string): Promise<SoilDataResponse> => {
  const res = await fetch(`/api/village/${villageId}/soil-data`);
  return res.json();
};

// Get terrain analysis for a village
export interface TerrainAnalysis {
  villageId: string;
  elevation: number;
  slope: string;
  drainageClass: string;
  vegetationType: string;
  landUseClasses: {
    class: string;
    percentage: number;
    area: number;
  }[];
  erosionRisk: {
    high: { percentage: number; area: number };
    medium: { percentage: number; area: number };
    low: { percentage: number; area: number };
  };
  waterAvailability: {
    groundwater: string;
    surfaceWater: string;
    rainwater: string;
  };
}

export const fetchTerrainAnalysis = async (villageId: string): Promise<TerrainAnalysis> => {
  const res = await fetch(`/api/village/${villageId}/terrain-analysis`);
  return res.json();
};
