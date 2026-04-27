import { loadVillageList, type VillageCSV } from "../data/csv_loader.ts";
import type { InputData } from "../types.ts";

export interface DataAgentOutput {
  input: InputData;
  village: VillageCSV | null;
}

export async function dataAgent(input: InputData): Promise<DataAgentOutput> {
  const villages = loadVillageList();
  const village = input.village_id
    ? villages.find((entry) => entry.village_id === input.village_id) ?? null
    : null;

  return {
    input,
    village,
  };
}
