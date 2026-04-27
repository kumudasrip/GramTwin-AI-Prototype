import type { MonthRisk, SimulationResult } from "../types.ts";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export function toRiskLevel(risk: MonthRisk["risk"] | RiskLevel): RiskLevel {
  if (risk === "HIGH" || risk === "High") return "HIGH";
  if (risk === "MEDIUM" || risk === "Medium") return "MEDIUM";
  return "LOW";
}

export function getOverallRisk(simulation: SimulationResult): RiskLevel {
  const latestRisk = simulation.timeline[simulation.timeline.length - 1]?.risk ?? "Low";
  return toRiskLevel(latestRisk);
}

export function toTitleRiskLevel(risk: RiskLevel): "Low" | "Medium" | "High" {
  if (risk === "HIGH") return "High";
  if (risk === "MEDIUM") return "Medium";
  return "Low";
}
