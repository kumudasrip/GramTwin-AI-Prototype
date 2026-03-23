// Village metadata including soil types, suitable crops, and climate data

export interface SoilType {
  id: string;
  name: string;
  color: string;
  characteristics: string[];
  suitableCrops: string[];
}

export interface CropSuitability {
  crop: string;
  waterNeeds: "Low" | "Medium" | "High";
  climateNeeds: string[];
  soilTypes: string[];
  season: string;
}

export interface VillageMetadata {
  villageId: string;
  villageName: string;
  soilComposition: {
    soilType: string;
    percentage: number;
    coordinates?: { lat: number; lng: number }[]; // regions
  }[];
  suitableCrops: CropSuitability[];
  currentWaterStatus: "Excellent" | "Good" | "Moderate" | "Poor" | "Critical";
  currentClimateStatus: "Excellent" | "Good" | "Moderate" | "Challenging" | "Critical";
  infrastructureNeeds: string[];
}

export interface VillageReport {
  id: string;
  villageId: string;
  reportDate: string;
  submittedBy: string;
  submitterType: "Panchayat" | "NGO" | "Government";
  waterStatus: "Excellent" | "Good" | "Moderate" | "Poor" | "Critical";
  waterDetails: string;
  climateStatus: "Excellent" | "Good" | "Moderate" | "Challenging" | "Critical";
  climateDetails: string;
  currentChallenges: string[];
  notes: string;
}

export interface InfrastructureRecommendation {
  id: string;
  villageId: string;
  type: string;
  priority: "High" | "Medium" | "Low";
  description: string;
  estimatedCost?: string;
  implementation?: string;
  source: "Photo" | "Map" | "Report";
  relatedAsset?: string;
  statusCondition?: string;
}

// Predefined soil types for villages
export const SOIL_TYPES: Record<string, SoilType> = {
  loamy: {
    id: "loamy",
    name: "Loamy",
    color: "#8B7355",
    characteristics: ["Well-draining", "Fertile", "Balanced texture"],
    suitableCrops: ["Wheat", "Paddy", "Sugarcane", "Cotton"]
  },
  clayey: {
    id: "clayey",
    name: "Clayey",
    color: "#A0522D",
    characteristics: ["High water retention", "Nutrient-rich", "Poor drainage"],
    suitableCrops: ["Paddy", "Jute", "Sugarcane"]
  },
  sandy: {
    id: "sandy",
    name: "Sandy",
    color: "#D2B48C",
    characteristics: ["Low water retention", "Good drainage", "Low fertility"],
    suitableCrops: ["Groundnut", "Millets", "Beans"]
  },
  reddish: {
    id: "reddish",
    name: "Red Soil",
    color: "#CD5C5C",
    characteristics: ["Well-drained", "Slightly acidic", "Good for plantations"],
    suitableCrops: ["Cotton", "Groundnut", "Sugarcane", "Vegetables"]
  },
  alluvial: {
    id: "alluvial",
    name: "Alluvial",
    color: "#D3D3D3",
    characteristics: ["Very fertile", "Mixed texture", "Good water holding"],
    suitableCrops: ["Paddy", "Wheat", "Cotton", "Sugarcane"]
  }
};

// Crop suitability information
export const CROP_SUITABILITY: Record<string, CropSuitability> = {
  paddy: {
    crop: "Paddy",
    waterNeeds: "High",
    climateNeeds: ["Monsoon", "High humidity"],
    soilTypes: ["clayey", "loamy", "alluvial"],
    season: "June-October"
  },
  wheat: {
    crop: "Wheat",
    waterNeeds: "Medium",
    climateNeeds: ["Moderate temperature", "Low rainfall"],
    soilTypes: ["loamy", "alluvial"],
    season: "October-March"
  },
  cotton: {
    crop: "Cotton",
    waterNeeds: "Medium",
    climateNeeds: ["Warm", "Moderate rainfall"],
    soilTypes: ["loamy", "reddish"],
    season: "April-September"
  },
  sugarcane: {
    crop: "Sugarcane",
    waterNeeds: "High",
    climateNeeds: ["Warm", "Humid"],
    soilTypes: ["loamy", "clayey", "alluvial"],
    season: "Year-round"
  },
  groundnut: {
    crop: "Groundnut",
    waterNeeds: "Low",
    climateNeeds: ["Warm", "Moderate rainfall"],
    soilTypes: ["sandy", "loamy", "reddish"],
    season: "June-September"
  },
  millets: {
    crop: "Millets",
    waterNeeds: "Low",
    climateNeeds: ["Hot", "Low rainfall"],
    soilTypes: ["sandy", "reddish"],
    season: "June-November"
  },
  vegetables: {
    crop: "Vegetables",
    waterNeeds: "Medium",
    climateNeeds: ["Temperate", "Moderate rainfall"],
    soilTypes: ["loamy", "alluvial", "reddish"],
    season: "Year-round"
  }
};

// Village-specific metadata
export const VILLAGE_METADATA: Record<string, VillageMetadata> = {
  NARSING_BATLA: {
    villageId: "NARSING_BATLA",
    villageName: "Narsing Batla",
    soilComposition: [
      { soilType: "clayey", percentage: 45, coordinates: [{lat: 17.053, lng: 79.170}] }, // Black soil (clayey) - North zone
      { soilType: "reddish", percentage: 35, coordinates: [{lat: 17.048, lng: 79.173}] }, // Red loam - East zone
      { soilType: "alluvial", percentage: 20, coordinates: [{lat: 17.042, lng: 79.168}] } // Bottom areas
    ],
    suitableCrops: [
      CROP_SUITABILITY.paddy,
      CROP_SUITABILITY.cotton,
      CROP_SUITABILITY.millets,
      CROP_SUITABILITY.groundnut
    ],
    currentWaterStatus: "Moderate",
    currentClimateStatus: "Moderate",
    infrastructureNeeds: [
      "Check dams for monsoon water harvesting",
      "Pond deepening and renovation",
      "Drip irrigation system installation",
      "Well water level monitoring system",
      "Farm ponds in high-infiltration areas"
    ]
  },
  V001: {
    villageId: "V001",
    villageName: "Village V001",
    soilComposition: [
      { soilType: "loamy", percentage: 60 },
      { soilType: "sandy", percentage: 30 },
      { soilType: "clayey", percentage: 10 }
    ],
    suitableCrops: [
      CROP_SUITABILITY.paddy,
      CROP_SUITABILITY.wheat,
      CROP_SUITABILITY.cotton
    ],
    currentWaterStatus: "Good",
    currentClimateStatus: "Good",
    infrastructureNeeds: ["Water harvesting", "Irrigation system"]
  },
  V002: {
    villageId: "V002",
    villageName: "Village V002",
    soilComposition: [
      { soilType: "clayey", percentage: 50 },
      { soilType: "alluvial", percentage: 40 },
      { soilType: "reddish", percentage: 10 }
    ],
    suitableCrops: [
      CROP_SUITABILITY.paddy,
      CROP_SUITABILITY.sugarcane,
      CROP_SUITABILITY.vegetables
    ],
    currentWaterStatus: "Good",
    currentClimateStatus: "Moderate",
    infrastructureNeeds: ["Drainage system", "Storage facility"]
  },
  V003: {
    villageId: "V003",
    villageName: "Village V003",
    soilComposition: [
      { soilType: "sandy", percentage: 70 },
      { soilType: "reddish", percentage: 20 },
      { soilType: "loamy", percentage: 10 }
    ],
    suitableCrops: [
      CROP_SUITABILITY.groundnut,
      CROP_SUITABILITY.millets,
      CROP_SUITABILITY.vegetables
    ],
    currentWaterStatus: "Moderate",
    currentClimateStatus: "Challenging",
    infrastructureNeeds: ["Water harvesting", "Well deepening"]
  }
};

// In-memory storage for reports (in production, use a database)
let villageReports: VillageReport[] = [];
let infrastructureRecommendations: InfrastructureRecommendation[] = [];

export function addVillageReport(report: VillageReport): VillageReport {
  villageReports.push(report);
  return report;
}

export function getVillageReports(villageId: string): VillageReport[] {
  return villageReports.filter(r => r.villageId === villageId);
}

export function getLatestReport(villageId: string): VillageReport | undefined {
  const reports = villageReports.filter(r => r.villageId === villageId);
  return reports.length > 0 ? reports[reports.length - 1] : undefined;
}

export function addInfrastructureRecommendation(rec: InfrastructureRecommendation): InfrastructureRecommendation {
  infrastructureRecommendations.push(rec);
  return rec;
}

export function getInfrastructureRecommendations(villageId: string): InfrastructureRecommendation[] {
  return infrastructureRecommendations.filter(r => r.villageId === villageId);
}

export function generateInfrastructureRecommendations(villageId: string): InfrastructureRecommendation[] {
  const metadata = VILLAGE_METADATA[villageId];
  const latestReport = getLatestReport(villageId);

  if (!metadata) return [];

  const recommendations: InfrastructureRecommendation[] = [];

  // Generate recommendations based on water status
  if (latestReport?.waterStatus === "Poor" || latestReport?.waterStatus === "Critical" || metadata.currentWaterStatus === "Moderate") {
    recommendations.push({
      id: `infra_${Date.now()}_1`,
      villageId,
      type: "Water Management",
      priority: "High",
      description: "Install water harvesting structures and check well water levels",
      estimatedCost: "Medium",
      implementation: "3-6 months",
      source: "Report",
      statusCondition: latestReport?.waterStatus || metadata.currentWaterStatus
    });
  }

  // Generate recommendations based on soil composition
  const sandyPercentage = metadata.soilComposition.find(s => s.soilType === "sandy")?.percentage || 0;
  if (sandyPercentage > 50) {
    recommendations.push({
      id: `infra_${Date.now()}_2`,
      villageId,
      type: "Soil Improvement",
      priority: "High",
      description: "Implement organic matter addition and mulching to improve water retention",
      estimatedCost: "Low",
      implementation: "Seasonal",
      source: "Report",
      statusCondition: "Sandy soil composition"
    });
  }

  // Generate recommendations based on climate
  if (latestReport?.climateStatus === "Challenging" || latestReport?.climateStatus === "Critical") {
    recommendations.push({
      id: `infra_${Date.now()}_3`,
      villageId,
      type: "Climate Adaptation",
      priority: "High",
      description: "Invest in drought-resistant crops and improved irrigation systems",
      estimatedCost: "Medium to High",
      implementation: "6-12 months",
      source: "Report",
      statusCondition: latestReport.climateStatus
    });
  }

  recommendations.push(...metadata.infrastructureNeeds.map((need, idx) => ({
    id: `infra_${Date.now()}_${idx + 4}`,
    villageId,
    type: "General Infrastructure",
    priority: "Medium" as const,
    description: need,
    estimatedCost: "Medium",
    implementation: "6-12 months",
    source: "Map" as const,
    statusCondition: "Village metadata"
  })));

  return recommendations;
}
