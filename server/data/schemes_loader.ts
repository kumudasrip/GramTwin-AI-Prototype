import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Types
export interface Scheme {
  name: string;
  category: string;
  status: string;
}

export interface VillageState {
  population?: number;
  households?: number;
  groundwater_index?: number;
  water_risk?: "High" | "Medium" | "Low";
  flood_prone?: boolean;
  main_crops?: string[];
  income_level_approx?: "Low" | "Medium" | "High";
  existing_infra?: string[];
}

export interface RecommendedScheme {
  scheme_name: string;
  category: string;
  status: string;
  priority: "High" | "Medium" | "Low";
  reason: string;
  eligibility_score: number;
}

// Load schemes JSON
function loadSchemesData(): Record<string, Scheme[]> {
  try {
    const filePath = path.join(__dirname, "government_schemes.json");
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error loading schemes data:", error);
    return {};
  }
}

// Load schemes for a village
export function loadSchemesForVillage(village_id: string): Scheme[] {
  const schemesData = loadSchemesData();
  return schemesData[village_id] || [];
}

// Calculate eligibility score for a scheme
export function getEligibilityScore(
  village_state: VillageState,
  scheme: Scheme,
  currentCrop?: string
): { score: number; priority: "High" | "Medium" | "Low"; reason: string } {
  let score = 0;
  let priority: "High" | "Medium" | "Low" = "Low";
  let reason = "";

  const { category } = scheme;
  const {
    groundwater_index = 0.5,
    water_risk = "Low",
    income_level_approx = "Medium",
    households = 1000,
    flood_prone = false,
    main_crops = [],
  } = village_state;

  // Water schemes
  if (category === "water") {
    if (
      water_risk === "High" ||
      water_risk === "Medium" ||
      groundwater_index < 0.6
    ) {
      score = 0.95;
      priority = "High";
      const waterReasons = [];
      if (water_risk === "High" || water_risk === "Medium")
        waterReasons.push(`water-risk is ${water_risk}`);
      if (groundwater_index < 0.6) waterReasons.push("groundwater under pressure");
      reason = `Critical water need: ${waterReasons.join(", ")}`;
    } else {
      score = 0.5;
      priority = "Low";
      reason = "Water situation is stable, lower priority";
    }
  }

  // Employment schemes
  else if (category === "employment") {
    if (income_level_approx === "Low") {
      score = 0.9;
      priority = "High";
      reason = "Low income communities need employment support";
    } else if (income_level_approx === "Medium") {
      score = 0.6;
      priority = "Medium";
      reason = "Medium income level, supplementary employment needed";
    } else {
      score = 0.3;
      priority = "Low";
      reason = "Higher income levels reduce employment need";
    }
  }

  // Housing schemes
  else if (category === "housing") {
    if (households > 2000) {
      score = 0.85;
      priority = "High";
      reason = `Large village (${households} households) needs housing development`;
    } else if (households > 1000) {
      score = 0.7;
      priority = "Medium";
      reason = `Medium-sized village (${households} households), moderate housing needs`;
    } else {
      score = 0.4;
      priority = "Low";
      reason = "Smaller village, lower housing priority";
    }
  }

  // Agriculture schemes - ENHANCED with current crop awareness
  else if (category === "agriculture") {
    const cropList = currentCrop ? [currentCrop] : main_crops;
    const waterIntensiveCrops = ["Paddy", "Sugarcane", "Rice"];
    const isDroughtResistant = ["Millets", "Pulses", "Jowar"];
    
    if (cropList && cropList.length > 0) {
      const hasWaterIntensive = cropList.some(c => waterIntensiveCrops.includes(c));
      const hasDroughtResistant = cropList.some(c => isDroughtResistant.includes(c));
      
      // Boost score for water-intensive crops when water is needed
      if (hasWaterIntensive && (water_risk === "High" || water_risk === "Medium" || groundwater_index < 0.6)) {
        score = 0.95;
        priority = "High";
        reason = `${cropList[0]} requires irrigation support - water risk detected`;
      } 
      // Lower score for drought-resistant crops
      else if (hasDroughtResistant) {
        score = 0.6;
        priority = "Medium";
        reason = `${cropList[0]} is drought-resistant but can benefit from irrigation schemes`;
      } else {
        score = 0.8;
        priority = "Medium";
        reason = `Agricultural community (crop: ${cropList[0]})`;
      }
    } else {
      score = 0.3;
      priority = "Low";
      reason = "Limited agricultural activity";
    }
  }

  // Health schemes
  else if (category === "health") {
    if (households > 1500) {
      score = 0.75;
      priority = "Medium";
      reason = "Large population requires health infrastructure";
    } else {
      score = 0.6;
      priority = "Medium";
      reason = "Standard health support needed";
    }
  }

  // Default
  else {
    score = 0.5;
    priority = "Medium";
    reason = "General development scheme";
  }

  return { score: Math.min(score, 1.0), priority, reason };
}

// Recommend schemes for a village
export function recommendSchemesForVillage(
  village_id: string,
  village_state: VillageState,
  currentCrop?: string
): RecommendedScheme[] {
  const schemes = loadSchemesForVillage(village_id);

  const recommendations: RecommendedScheme[] = schemes
    .map((scheme) => {
      const { score, priority, reason } = getEligibilityScore(
        village_state,
        scheme,
        currentCrop
      );
      return {
        scheme_name: scheme.name,
        category: scheme.category,
        status: scheme.status,
        priority: priority,
        reason: reason,
        eligibility_score: score,
      };
    })
    .filter((rec) => rec.priority !== "Low")
    .sort(
      (a, b) =>
        (b.priority === "High" ? 2 : 1) - (a.priority === "High" ? 2 : 1)
    )
    .sort((a, b) => b.eligibility_score - a.eligibility_score);

  return recommendations;
}

// Get all schemes for a village (no filtering)
export function getAllSchemesForVillage(village_id: string): Scheme[] {
  return loadSchemesForVillage(village_id);
}
