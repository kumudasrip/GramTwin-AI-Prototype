export interface InputData {
  village_id?: string;
  population: number;
  rainfall_forecast?: "Below normal" | "Normal" | "Above normal";
  groundwater_level: string;
  current_crop: string;
}

export interface MonthRisk {
  month: string;
  risk: "Low" | "Medium" | "High";
  water_stock: number;
}

export interface CropRecommendation {
  crop: string;
  suitability: "Low" | "Medium" | "High";
  reason: string;
}

export interface SimulationResult {
  timeline: MonthRisk[];
  crop_recommendations: CropRecommendation[];
  alerts: string[];
  water_stock_per_month: number[];
  rainfall_info?: {
    avg_rainfall_mm: number;
    rainfall_category: string;
  };
}

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
