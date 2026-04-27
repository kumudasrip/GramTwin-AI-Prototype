import { runSimulationScenario } from "./simulation.ts";
import type { InputData, SimulationResult } from "./types.ts";

export interface ScenarioSummary {
  id: string;
  label: string;
  changes: string[];
  final_water_level: number;
  final_risk: "Low" | "Medium" | "High";
  simulation: SimulationResult;
}

export interface BestActionResponse {
  original_result: ScenarioSummary;
  all_results: ScenarioSummary[];
  best_result: ScenarioSummary;
  what_changed: string[];
  explanation: string;
}

function normalizeRainfall(
  rainfall: InputData["rainfall_forecast"] | string | undefined
): NonNullable<InputData["rainfall_forecast"]> {
  if (rainfall === "Below normal" || rainfall === "Normal" || rainfall === "Above normal") {
    return rainfall;
  }
  return "Normal";
}

function slightlyIncreaseRainfall(
  rainfall: NonNullable<InputData["rainfall_forecast"]>
): NonNullable<InputData["rainfall_forecast"]> | null {
  if (rainfall === "Below normal") return "Normal";
  if (rainfall === "Normal") return "Above normal";
  return null;
}

function chooseLowWaterCrop(currentCrop: string): string {
  const lowered = currentCrop.trim().toLowerCase();
  if (lowered === "paddy" || lowered === "rice") return "Millets";
  if (lowered === "sugarcane") return "Pulses";
  if (lowered === "cotton") return "Pulses";
  return "Millets";
}

function summarizeScenario(
  id: string,
  label: string,
  changes: string[],
  simulation: SimulationResult
): ScenarioSummary {
  const finalRisk = simulation.timeline[simulation.timeline.length - 1]?.risk ?? "Low";
  const finalWater = simulation.water_stock_per_month[simulation.water_stock_per_month.length - 1] ?? 0;

  return {
    id,
    label,
    changes,
    final_water_level: Number(finalWater.toFixed(1)),
    final_risk: finalRisk,
    simulation,
  };
}

function riskRank(risk: ScenarioSummary["final_risk"]): number {
  if (risk === "Low") return 0;
  if (risk === "Medium") return 1;
  return 2;
}

function compareScenarios(a: ScenarioSummary, b: ScenarioSummary): number {
  const byRisk = riskRank(a.final_risk) - riskRank(b.final_risk);
  if (byRisk !== 0) return byRisk;

  const byWater = b.final_water_level - a.final_water_level;
  if (byWater !== 0) return byWater;

  return a.changes.length - b.changes.length;
}

function buildExplanation(original: ScenarioSummary, best: ScenarioSummary): string {
  if (best.id === original.id) {
    return "Current input already gives the best balance of water level and risk.";
  }

  const changeText = best.changes.join(" and ").toLowerCase();
  return `${capitalize(changeText)} improves water outlook from ${original.final_risk} to ${best.final_risk}.`;
}

function capitalize(text: string): string {
  if (!text) return text;
  return text[0].toUpperCase() + text.slice(1);
}

export async function recommendBestAction(input: InputData): Promise<BestActionResponse> {
  const baseline = runSimulationScenario(input);
  const normalizedRainfall = normalizeRainfall(input.rainfall_forecast ?? baseline.rainfall_info?.rainfall_category);
  const normalizedInput: InputData = {
    ...input,
    rainfall_forecast: normalizedRainfall,
  };

  const lowWaterCrop = chooseLowWaterCrop(normalizedInput.current_crop);
  const slightlyBetterRainfall = slightlyIncreaseRainfall(normalizedRainfall);

  // Run all simulations in parallel using Promise.all
  const simulationPromises = [
    Promise.resolve(runSimulationScenario(normalizedInput)).then(sim => 
      summarizeScenario("original", "Original input", ["No changes"], sim)
    ),
    Promise.resolve(runSimulationScenario({ ...normalizedInput, current_crop: lowWaterCrop })).then(sim =>
      summarizeScenario("crop_switch", "Switch to low water crop", 
        [`Crop switch: ${normalizedInput.current_crop} -> ${lowWaterCrop}`], sim)
    ),
    Promise.resolve(runSimulationScenario(normalizedInput, { irrigationMultiplier: 0.8 })).then(sim =>
      summarizeScenario("irrigation_reduce_20", "Reduce irrigation by 20%", 
        ["Irrigation reduced by 20%"], sim)
    ),
    Promise.resolve(runSimulationScenario(
      { ...normalizedInput, current_crop: lowWaterCrop },
      { irrigationMultiplier: 0.8 }
    )).then(sim =>
      summarizeScenario("crop_switch_and_irrigation_reduce_20", "Switch crop + reduce irrigation",
        [`Crop switch: ${normalizedInput.current_crop} -> ${lowWaterCrop}`, "Irrigation reduced by 20%"], sim)
    ),
  ];

  // Add rainfall scenario if applicable
  if (slightlyBetterRainfall) {
    simulationPromises.push(
      Promise.resolve(runSimulationScenario(normalizedInput, { rainfallOverride: slightlyBetterRainfall })).then(sim =>
        summarizeScenario("rainfall_slightly_higher", "Slightly higher rainfall",
          [`Rainfall adjusted: ${normalizedRainfall} -> ${slightlyBetterRainfall}`], sim)
      )
    );
  }

  // Wait for all simulations to complete
  const allResults = await Promise.all(simulationPromises);

  const best = [...allResults].sort(compareScenarios)[0];

  return {
    original_result: allResults[0],
    all_results: allResults,
    best_result: best,
    what_changed: best.id === "original" ? ["No changes"] : best.changes,
    explanation: buildExplanation(allResults[0], best),
  };
}
