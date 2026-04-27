import { simulateVillage } from "../simulation.ts";
import type { SimulationResult } from "../types.ts";
import type { DataAgentOutput } from "./dataAgent.ts";

export interface SimulationAgentOutput extends DataAgentOutput {
  simulation: SimulationResult;
}

export async function simulationAgent(data: DataAgentOutput): Promise<SimulationAgentOutput> {
  const simulation = simulateVillage(data.input);

  return {
    ...data,
    simulation,
  };
}
