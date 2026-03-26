import { InputData, SimulationResult, BaselineData, MonthRisk, CropRecommendation } from "./types.ts";
import defaultScenario from "./config/default_scenario.json" assert { type: "json" };
import { loadRainfallData } from "./data/csv_loader.ts";

let lastSimulation: SimulationResult | null = null;

export function getBaselineData(): BaselineData {
  return {
    population: defaultScenario.population,
    households: defaultScenario.households,
    livestock: defaultScenario.livestock,
    main_crop: defaultScenario.main_crop,
    groundwater_level: "Declining",
  };
}

function generateRecommendations(
  population: number,
  rainfall_forecast: string,
  current_crop: string,
  timeline: MonthRisk[]
): { crop_recs: CropRecommendation[], alerts: string[] } {
  const lastMonthRisk = timeline[timeline.length - 1].risk;
  const alerts: string[] = [];
  const crop_recs: CropRecommendation[] = [];

  if (lastMonthRisk === "High") {
    alerts.push(
      "Water shortage likely in 3 months.",
      "Switch part of the paddy area to millets.",
      "Reduce irrigation by 25%.",
      "Activate rainwater harvesting if structures exist.",
      "Consider groundwater-recharge structures."
    );
  } else if (lastMonthRisk === "Medium") {
    alerts.push(
      "Monitor groundwater closely each month.",
      "Optimize irrigation scheduling."
    );
  } else {
    alerts.push("Current water usage is sustainable.");
  }

  // Generate crop recommendations based on risk and rainfall
  const crops = ["Paddy", "Millets", "Pulses"];
  const cropMarketValues: Record<string, string> = {
    "Paddy": "₹2,000-2,500 per quintal",
    "Millets": "₹3,500-4,000 per quintal",
    "Pulses": "₹4,000-5,500 per quintal"
  };

  for (const crop of crops) {
    let suitability: "Low" | "Medium" | "High" = "Medium";
    let reason = "";

    if (crop === "Paddy") {
      if (rainfall_forecast === "Below normal" || lastMonthRisk === "High") {
        suitability = "Low";
        reason = "High water need, risky under current conditions.";
      } else {
        suitability = "Medium";
        reason = "Traditional crop, but requires careful water management.";
      }
    } else if (crop === "Millets") {
      suitability = "High";
      reason = "Low water need, drought-resilient and highly suitable.";
    } else if (crop === "Pulses") {
      suitability = lastMonthRisk === "High" ? "Medium" : "High";
      reason = "Moderate water need, good for soil health.";
    }

    crop_recs.push({ 
      crop, 
      suitability, 
      reason,
      market_value: cropMarketValues[crop]
    });
  }

  return { crop_recs, alerts };
}

export function simulateVillage(input: InputData): SimulationResult {
  const { population, current_crop, village_id } = input;
  let { rainfall_forecast } = input;
  
  let rainfall_info;
  if (!rainfall_forecast && village_id) {
    const info = loadRainfallData(village_id);
    rainfall_forecast = info.rainfall_category as any;
    rainfall_info = info;
  }

  let water_stock = 100; // abstract units
  const timeline: MonthRisk[] = [];
  const water_stock_per_month: number[] = [];

  const domestic_factor = defaultScenario.domestic_water_per_capita_per_month;
  const irrigation_map = defaultScenario.irrigation_water_by_crop as Record<string, number>;
  const recharge_map = defaultScenario.recharge_by_rainfall as Record<string, number>;

  for (let i = 1; i <= defaultScenario.months_to_simulate; i++) {
    const domestic_demand = population * domestic_factor;
    const irrigation_demand = irrigation_map[current_crop] || 10;
    const recharge = recharge_map[rainfall_forecast || "Normal"] || 10;

    water_stock = water_stock - domestic_demand - irrigation_demand + recharge;
    
    // Clamp between 0 and 100
    water_stock = Math.max(0, Math.min(100, water_stock));
    water_stock_per_month.push(Number(water_stock.toFixed(1)));

    let risk: "Low" | "Medium" | "High";
    if (water_stock >= 70) risk = "Low";
    else if (water_stock >= 40) risk = "Medium";
    else risk = "High";

    timeline.push({ 
      month: `Month ${i}`, 
      risk, 
      water_stock: Number(water_stock.toFixed(1)) 
    });
  }

  const { crop_recs, alerts } = generateRecommendations(population, rainfall_forecast || "Normal", current_crop, timeline);

  const result: SimulationResult = {
    timeline,
    crop_recommendations: crop_recs,
    alerts,
    water_stock_per_month,
    rainfall_info
  };

  lastSimulation = result;
  return result;
}

export function getLastSimulation(): SimulationResult | null {
  return lastSimulation;
}

export function getLatestAlerts(): string[] {
  return lastSimulation ? lastSimulation.alerts : [
    "Welcome to GramTwin AI - Your Agricultural Digital Twin",
    "Run a simulation from the Dashboard to analyze water security for your village",
    "Monitor groundwater levels and plan irrigation schedules based on seasonal rainfall forecasts"
  ];
}
