// In-memory cache for data and simulation results
// Data is loaded once at startup, simulations are cached by input hash

import type { VillageCSV, RainfallCSV } from "./data/csv_loader.ts";
import type { SimulationResult } from "./types.ts";
import crypto from "crypto";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// In-memory storage
const dataCache = new Map<string, CacheEntry<any>>();
const simulationCache = new Map<string, CacheEntry<SimulationResult>>();

// Cache configuration (5 minute TTL for simulations, permanent for data)
const SIMULATION_TTL = 5 * 60 * 1000; // 5 minutes
const DATA_TTL = Infinity; // Permanent during server lifetime

export function setCacheData<T>(key: string, data: T): void {
  dataCache.set(key, { data, timestamp: Date.now() });
}

export function getCacheData<T>(key: string): T | null {
  const entry = dataCache.get(key);
  if (!entry) return null;
  
  if (entry.timestamp + DATA_TTL < Date.now()) {
    dataCache.delete(key);
    return null;
  }
  
  return entry.data as T;
}

export function setSimulationCache(input: any, result: SimulationResult): void {
  const hash = hashInput(input);
  simulationCache.set(hash, { data: result, timestamp: Date.now() });
}

export function getSimulationCache(input: any): SimulationResult | null {
  const hash = hashInput(input);
  const entry = simulationCache.get(hash);
  
  if (!entry) return null;
  
  if (entry.timestamp + SIMULATION_TTL < Date.now()) {
    simulationCache.delete(hash);
    return null;
  }
  
  return entry.data;
}

export function hashInput(input: any): string {
  // Create a stable hash of the input for caching
  const str = JSON.stringify(input);
  return crypto.createHash("sha256").update(str).digest("hex");
}

export function clearSimulationCache(): void {
  simulationCache.clear();
}

export function clearAllCache(): void {
  dataCache.clear();
  simulationCache.clear();
}

export function getCacheStats() {
  return {
    dataKeys: dataCache.size,
    simulationKeys: simulationCache.size,
  };
}
