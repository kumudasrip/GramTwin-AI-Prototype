import type { CropRecommendation, InputData, SimulationResult } from "../types.ts";
import { advisorAgent, type AdvisorActionPlan } from "./advisorAgent.ts";
import { dataAgent } from "./dataAgent.ts";
import { riskAgent, type RiskAssessment } from "./riskAgent.ts";
import { simulationAgent } from "./simulationAgent.ts";
import type { RecommendedScheme } from "../data/schemes_loader.ts";

export interface AgencyRunResult extends SimulationResult {
  agent_pipeline: {
    data: {
      village_id: string | null;
      village_name: string | null;
    };
    risk: RiskAssessment;
    advisor: {
      crop_recommendations_count: number;
      recommendations: CropRecommendation[];
      schemes: RecommendedScheme[];
      actionPlan: AdvisorActionPlan;
      explanation: string;
    };
  };
}

export async function run(input: InputData): Promise<AgencyRunResult> {
  const data = await dataAgent(input);
  console.log("[Data Agent] Loaded data");

  const simulated = await simulationAgent(data);
  console.log("[Simulation Agent] Completed simulation");

  const risk = await riskAgent(simulated);
  console.log("[Risk Agent] Risk evaluated");

  const advised = await advisorAgent(risk);
  console.log("[Advisor Agent] Recommendations generated");

  return {
    ...advised.simulation,
    agent_pipeline: {
      data: {
        village_id: advised.village?.village_id ?? advised.input.village_id ?? null,
        village_name: advised.village?.village_name ?? null,
      },
      risk: advised.risk,
      advisor: {
        crop_recommendations_count: advised.advisor.crop_recommendations.length,
        recommendations: advised.advisor.recommendations,
        schemes: advised.advisor.schemes,
        actionPlan: advised.advisor.actionPlan,
        explanation: advised.advisor.explanation,
      },
    },
  };
}

export const agency = { run };
