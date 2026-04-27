import { recommendSchemesForVillage, type RecommendedScheme, type VillageState } from "../data/schemes_loader.ts";
import type { CropRecommendation } from "../types.ts";
import type { RiskAgentOutput } from "./riskAgent.ts";
import {
  generateActionPlans,
  generateExplanation,
  buildActionSummary,
  type ActionPlanResult,
} from "../services/advisorRecommendations.ts";
import { toTitleRiskLevel } from "../services/risk.ts";

export interface AdvisorActionPlan extends ActionPlanResult {
  summary: string;
}

export interface AdvisorOutput {
  recommendations: CropRecommendation[];
  crop_recommendations: CropRecommendation[];
  schemes: RecommendedScheme[];
  actionPlan: AdvisorActionPlan;
  explanation: string;
}

export interface AdvisorAgentOutput extends RiskAgentOutput {
  advisor: AdvisorOutput;
}

function buildVillageState(data: RiskAgentOutput): VillageState {
  const { village, input, risk } = data;
  const groundwaterLevel = village?.groundwater_level_initial;

  return {
    population: village?.population ?? input.population,
    households: village?.households ?? 0,
    groundwater_index:
      typeof groundwaterLevel === "number"
        ? Math.max(0, 1 - Math.max(0, groundwaterLevel - 5) / 30)
        : 0.5,
    water_risk:
      typeof groundwaterLevel === "number"
        ? groundwaterLevel < 10
          ? "High"
          : groundwaterLevel < 20
            ? "Medium"
            : "Low"
        : toTitleRiskLevel(risk.overall),
    flood_prone: false,
    main_crops: village?.main_crop ? [village.main_crop] : [input.current_crop],
    income_level_approx: "Low",
    existing_infra: [],
  };
}

export async function advisorAgent(data: RiskAgentOutput): Promise<AdvisorAgentOutput> {
  const villageId = data.input.village_id;
  const villageState = buildVillageState(data);

  const schemes = villageId
    ? recommendSchemesForVillage(villageId, villageState, data.input.current_crop)
    : [];

  console.log("[Advisor Agent] Evaluating strategies...");
  const generatedPlan = generateActionPlans(data.simulation, data.input);
  const explanation = generateExplanation(data.simulation, data.input);
  const actionPlan: AdvisorActionPlan = {
    ...generatedPlan,
    summary: buildActionSummary(data.input, generatedPlan.bestStrategy, generatedPlan.improvement),
  };

  const baselineRisk = generatedPlan.allStrategies.find((item) => item.id === "current")?.riskLevel ?? actionPlan.bestStrategy.riskLevel;
  console.log(`[Advisor Agent] Best strategy selected: ${actionPlan.bestStrategy.id}`);
  console.log(`[Advisor Agent] Risk reduced from ${baselineRisk} to ${actionPlan.bestStrategy.riskLevel}`);

  return {
    ...data,
    advisor: {
      recommendations: data.simulation.crop_recommendations,
      crop_recommendations: data.simulation.crop_recommendations,
      schemes,
      actionPlan,
      explanation,
    },
  };
}
