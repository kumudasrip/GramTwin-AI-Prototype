import type { SimulationAgentOutput } from "./simulationAgent.ts";
import { toRiskLevel, type RiskLevel } from "../services/risk.ts";

export interface RiskAssessment {
  overall: RiskLevel;
  monthly: RiskLevel[];
}

export interface RiskAgentOutput extends SimulationAgentOutput {
  risk: RiskAssessment;
}

export async function riskAgent(data: SimulationAgentOutput): Promise<RiskAgentOutput> {
  const monthly = data.simulation.timeline.map((entry) => toRiskLevel(entry.risk));
  const overall = monthly.length > 0 ? monthly[monthly.length - 1] : "LOW";

  return {
    ...data,
    risk: {
      overall,
      monthly,
    },
  };
}
