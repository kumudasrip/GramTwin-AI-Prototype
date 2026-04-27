import defaultScenario from "../config/default_scenario.json" assert { type: "json" };
import { runSimulationScenario, type SimulationOptions } from "../simulation.ts";
import type { InputData, SimulationResult } from "../types.ts";
import { getOverallRisk, type RiskLevel } from "./risk.ts";

export interface StrategyResult {
  id: string;
  label: string;
  description: string;
  riskLevel: RiskLevel;
  finalWaterStock: number;
  totalWaterUsage: number;
  changeScore: number;
  adjustments: {
    crop?: string;
    irrigationReductionPercent?: number;
    rainfallScenario?: NonNullable<InputData["rainfall_forecast"]>;
  };
}

export interface ActionPlanResult {
  bestStrategy: StrategyResult;
  improvement: {
    riskChange: string;
    waterSavedPercent: number;
  };
  allStrategies: StrategyResult[];
}

function getRiskRank(risk: RiskLevel): number {
  if (risk === "LOW") return 0;
  if (risk === "MEDIUM") return 1;
  return 2;
}

function getFinalWaterFromSimulation(result: SimulationResult): number {
  const latestWater = result.water_stock_per_month[result.water_stock_per_month.length - 1];
  return typeof latestWater === "number" ? latestWater : 0;
}

function estimateTotalWaterUsage(input: InputData, options: SimulationOptions = {}): number {
  const irrigationMap = defaultScenario.irrigation_water_by_crop as Record<string, number>;
  const domesticFactor = defaultScenario.domestic_water_per_capita_per_month;
  const months = defaultScenario.months_to_simulate;
  const irrigationMultiplier = options.irrigationMultiplier ?? 1;

  const domesticTotal = input.population * domesticFactor * months;
  const irrigationTotal = (irrigationMap[input.current_crop] || 10) * irrigationMultiplier * months;
  return Number((domesticTotal + irrigationTotal).toFixed(2));
}

function chooseAlternativeCrop(currentCrop: string): string {
  if (currentCrop === "Paddy") return "Millets";
  if (currentCrop === "Millets") return "Pulses";
  return "Millets";
}

function normalizeRainfallScenario(
  rainfall: string | undefined
): NonNullable<InputData["rainfall_forecast"]> {
  if (rainfall === "Below normal" || rainfall === "Normal" || rainfall === "Above normal") {
    return rainfall;
  }
  return "Normal";
}

function evaluateStrategy(
  input: InputData,
  id: string,
  label: string,
  description: string,
  adjustedInput: InputData,
  options: SimulationOptions,
  changeScore: number,
  adjustments: StrategyResult["adjustments"]
): StrategyResult {
  const strategySimulation = runSimulationScenario(adjustedInput, options);

  return {
    id,
    label,
    description,
    riskLevel: getOverallRisk(strategySimulation),
    finalWaterStock: getFinalWaterFromSimulation(strategySimulation),
    totalWaterUsage: estimateTotalWaterUsage(adjustedInput, options),
    changeScore,
    adjustments,
  };
}

function compareStrategies(a: StrategyResult, b: StrategyResult): number {
  const byRisk = getRiskRank(a.riskLevel) - getRiskRank(b.riskLevel);
  if (byRisk !== 0) return byRisk;

  const byWater = b.finalWaterStock - a.finalWaterStock;
  if (byWater !== 0) return byWater;

  return a.changeScore - b.changeScore;
}

export function buildActionSummary(input: InputData, bestStrategy: StrategyResult, improvement: ActionPlanResult["improvement"]): string {
  if (bestStrategy.id === "current") {
    return "Current scenario already provides the best balance of water risk and storage for the next 3 months.";
  }

  if (bestStrategy.id.startsWith("crop_switch")) {
    return `Switching from ${input.current_crop} to ${bestStrategy.adjustments.crop} improves resilience with projected risk change ${improvement.riskChange}.`;
  }

  if (bestStrategy.id.startsWith("irrigation_reduce")) {
    return `Reducing irrigation by ${bestStrategy.adjustments.irrigationReductionPercent}% is projected to improve water security (${improvement.riskChange}).`;
  }

  if (bestStrategy.id === "improved_rainfall") {
    return `Improved rainfall conditions can shift water outlook from ${improvement.riskChange} while maintaining current farming patterns.`;
  }

  return "A balanced intervention strategy is recommended to reduce near-term water stress.";
}

export function generateActionPlans(simulationResult: SimulationResult, input: InputData): ActionPlanResult {
  const rainfallScenario = normalizeRainfallScenario(
    input.rainfall_forecast ?? simulationResult.rainfall_info?.rainfall_category
  );
  const normalizedInput: InputData = {
    ...input,
    rainfall_forecast: rainfallScenario,
  };

  const alternativeCrop = chooseAlternativeCrop(input.current_crop);
  const strategies: StrategyResult[] = [];

  strategies.push(
    evaluateStrategy(
      normalizedInput,
      "current",
      "Current Scenario",
      "Run baseline inputs without intervention",
      normalizedInput,
      {},
      0,
      {}
    )
  );

  strategies.push(
    evaluateStrategy(
      normalizedInput,
      "crop_switch",
      "Crop Switch",
      `Switch from ${input.current_crop} to ${alternativeCrop}`,
      { ...normalizedInput, current_crop: alternativeCrop },
      {},
      2,
      { crop: alternativeCrop }
    )
  );

  for (const reduction of [10, 20, 30]) {
    strategies.push(
      evaluateStrategy(
        normalizedInput,
        `irrigation_reduce_${reduction}`,
        `Irrigation Reduction ${reduction}%`,
        `Reduce irrigation demand by ${reduction}%`,
        normalizedInput,
        { irrigationMultiplier: 1 - reduction / 100 },
        reduction / 10,
        { irrigationReductionPercent: reduction }
      )
    );
  }

  if (rainfallScenario !== "Above normal") {
    strategies.push(
      evaluateStrategy(
        normalizedInput,
        "improved_rainfall",
        "Improved Rainfall",
        "Model above-normal rainfall impact",
        normalizedInput,
        { rainfallOverride: "Above normal" },
        1,
        { rainfallScenario: "Above normal" }
      )
    );
  }

  const sorted = [...strategies].sort(compareStrategies);
  const baseline = strategies.find((item) => item.id === "current") ?? sorted[0];
  const bestStrategy = sorted[0];

  const waterSavedPercent = baseline.totalWaterUsage > 0
    ? Number((((baseline.totalWaterUsage - bestStrategy.totalWaterUsage) / baseline.totalWaterUsage) * 100).toFixed(1))
    : 0;

  return {
    bestStrategy,
    improvement: {
      riskChange: `${baseline.riskLevel} -> ${bestStrategy.riskLevel}`,
      waterSavedPercent: Number(Math.max(0, waterSavedPercent).toFixed(1)),
    },
    allStrategies: sorted,
  };
}

export function generateExplanation(simulationResult: SimulationResult, input: InputData): string {
  const irrigationMap = defaultScenario.irrigation_water_by_crop as Record<string, number>;
  const domesticFactor = defaultScenario.domestic_water_per_capita_per_month;
  const rainfallScenario = input.rainfall_forecast ?? simulationResult.rainfall_info?.rainfall_category ?? "Normal";

  const irrigationDemand = irrigationMap[input.current_crop] || 10;
  const domesticDemand = input.population * domesticFactor;
  const totalDemand = irrigationDemand + domesticDemand;
  const irrigationShare = totalDemand > 0 ? (irrigationDemand / totalDemand) * 100 : 0;

  const finalRisk = simulationResult.timeline[simulationResult.timeline.length - 1]?.risk ?? "Low";
  const trend = finalRisk === "High"
    ? "declining rapidly"
    : finalRisk === "Medium"
      ? "under pressure"
      : "relatively stable";

  return `Water levels are ${trend} due to irrigation demand (${irrigationShare.toFixed(1)}%) from ${input.current_crop} cultivation under ${String(rainfallScenario).toLowerCase()} rainfall conditions.`;
}
