import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { getBaselineData, getLatestAlerts, getLastSimulation } from "./server/simulation.ts";
import { recommendBestAction } from "./server/bestActionAdvisor.ts";
import { agency } from "./server/agents/agency.ts";
import { loadVillageList, loadRainfallData } from "./server/data/csv_loader.ts";
import { loadGeoJSON } from "./server/geo_loader.ts";
import { 
  VILLAGE_METADATA, 
  addVillageReport, 
  getVillageReports, 
  getLatestReport,
  getInfrastructureRecommendations,
  generateInfrastructureRecommendations
} from "./server/data/village_metadata.ts";
import { recommendSchemesForVillage, VillageState } from "./server/data/schemes_loader.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/village/list", (req, res) => {
    const villages = loadVillageList();
    res.json(villages.map(v => ({ id: v.village_id, name: v.village_name })));
  });

  app.get("/api/village/:id/baseline", (req, res) => {
    const villages = loadVillageList();
    const village = villages.find(v => v.village_id === req.params.id);
    if (village) {
      res.json({
        population: village.population,
        households: village.households,
        livestock: village.livestock,
        main_crop: village.main_crop,
        groundwater_level: village.groundwater_level_initial > 30 ? "Stable" : "Declining",
        groundwater_level_initial: village.groundwater_level_initial,
        village_name: village.village_name,
        state: village.state,
        district: village.district
      });
    } else {
      res.status(404).json({ error: "Village not found" });
    }
  });

  app.get("/api/rainfall/:id", (req, res) => {
    const rainfall = loadRainfallData(req.params.id);
    res.json(rainfall);
  });

  // Map Data Endpoints
  app.get("/api/geo/villages", (req, res) => {
    const geo = loadGeoJSON("village_boundaries.json");
    res.json(geo);
  });

  app.get("/api/geo/village/:id/fields", (req, res) => {
    const geo = loadGeoJSON(`village_${req.params.id}_fields.json`);
    if (geo) res.json(geo);
    else res.status(404).json({ error: "Geo data not found" });
  });

  app.get("/api/geo/village/:id/wells", (req, res) => {
    const geo = loadGeoJSON(`village_${req.params.id}_wells.json`);
    if (geo) res.json(geo);
    else res.status(404).json({ error: "Geo data not found" });
  });

  app.get("/api/geo/village/:id/flood_risk", (req, res) => {
    const geo = loadGeoJSON(`village_${req.params.id}_flood_risk.json`);
    if (geo) res.json(geo);
    else res.status(404).json({ error: "Geo data not found" });
  });

  app.get("/api/village/baseline", (req, res) => {
    res.json(getBaselineData());
  });

  app.post("/api/village/simulate", async (req, res) => {
    try {
      const result = await agency.run(req.body);
      res.json(result);
    } catch (error) {
      console.error("Simulation pipeline failed:", error);
      res.status(500).json({ error: "Simulation failed" });
    }
  });

  app.post("/api/village/simulate/best-action", async (req, res) => {
    try {
      const result = await recommendBestAction(req.body);
      res.json(result);
    } catch (error) {
      console.error("Best action recommendation failed:", error);
      res.status(500).json({ error: "Best action recommendation failed" });
    }
  });

  app.get("/api/village/last_simulation", (req, res) => {
    const last = getLastSimulation();
    if (last) {
      res.json(last);
    } else {
      res.status(404).json({ error: "No simulation found" });
    }
  });

  app.get("/api/village/alerts", (req, res) => {
    res.json(getLatestAlerts());
  });

  // Get alerts for a specific village based on its baseline data
  app.get("/api/village/:id/alerts", (req, res) => {
    const villageId = req.params.id;
    const baseline = getBaselineData();
    
    const alerts: string[] = [];
    
    // Generate contextual alerts based on village id and data
    if (villageId === 'NARSING_BATLA') {
      alerts.push(
        // Critical groundwater alerts
        "⚠️ GROUNDWATER STATUS: Semi-Critical (73% development stage). Current utilization: 80 MCM of available 110 MCM.",
        "📊 GROUNDWATER MANAGEMENT: At current utilization rate, groundwater reserves are under pressure. Plan water conservation measures.",
        "💧 IRRIGATION RECOMMENDATION: With 4,236 population in 1,070 households and 284 wells, prioritize efficient drip irrigation for high-water crops (Paddy).",
        
        // Crop-specific alerts
        "🌾 PRIMARY CROP - PADDY (45% area): Highest water demand crop. Recommended: Micro-irrigation in summer seasons. Average water requirement: 1200 mm/season.",
        "🌿 SECONDARY CROPS: Cotton (25%), Millets (15%), Pulses (10%) - more water-efficient. Consider crop rotation for groundwater recovery.",
        
        // Rainfall-based alerts
        "🌧️ SEASONAL OBSERVATION: Monsoon months (Jul-Aug) receive 250-270mm/month. Rainwater harvesting during monsoon can reduce groundwater extraction by 40-50%.",
        
        // Infrastructure alerts
        "🏗️ WATER INFRASTRUCTURE: 284 wells, 145 bore wells, 3 ponds, 2 irrigation channels. Current well density adequate. Recommend check dams and farm ponds to improve recharge.",
        
        // Soil-based recommendations
        "🌱 SOIL MANAGEMENT: Black soil and red loam prevalent. High infiltration potential - good for groundwater recharge. Plan percolation tanks in summer.",
        
        // Population and household alerts
        "👥 POPULATION WATER NEEDS: 4,236 population requires ~210 liters/day (total ~890,000L daily). Ensure adequate drinking water access in dry seasons (Mar-Jun).",
        
        // Seasonal planning
        "📅 CRITICAL MONTHS: Apr-Jun - expect low rainfall and high irrigation demand. Pre-monsoon (Feb-Mar) - fill water bodies for summer use.",
        
        // Action items
        "✅ ACTION ITEMS: 1) Install more check dams 2) Promote drip irrigation 3) Run monsoon water harvesting 4) Monitor well depths monthly 5) Plan crop diversification"
      );
    } else if (villageId === 'V001') {
      alerts.push(
        "V001: Water stress projected in summer months (Apr-Jun). Plan irrigation accordingly.",
        "Black soil area: High moisture retention - optimize for water-intensive crops like rice.",
        "Monitor groundwater levels - currently declining trend detected."
      );
    } else if (villageId === 'V002') {
      alerts.push(
        "V002: Mixed soil composition requires adaptive irrigation strategies.",
        "Laterite soil in North Zone: Lower fertility - consider specialized fertilization.",
        "Agriculture-dependent economy: Focus on drought-resistant crops in dry season."
      );
    } else if (villageId === 'V003') {
      alerts.push(
        "V003: Predominantly sandy/red soil - requires careful water management.",
        "High evaporation risk: Implement mulching and rainwater harvesting structures.",
        "Groundwater depth: Monitor seasonal variations for irrigation scheduling."
      );
    } else {
      alerts.push(
        "Welcome to GramTwin AI - Your Agricultural Digital Twin",
        "Run a simulation from the Dashboard to analyze water security for this village",
        "Monitor groundwater levels and plan irrigation schedules based on seasonal rainfall forecasts"
      );
    }
    
    res.json(alerts);
  });

  // ===== New API Endpoints for Reports & Infrastructure =====

  // Get village metadata with soil types and crop information
  app.get("/api/village/:id/metadata", (req, res) => {
    const metadata = VILLAGE_METADATA[req.params.id];
    if (metadata) {
      res.json(metadata);
    } else {
      res.status(404).json({ error: "Metadata not found" });
    }
  });

  // Get all reports for a village
  app.get("/api/village/:id/reports", (req, res) => {
    const reports = getVillageReports(req.params.id);
    res.json(reports);
  });

  // Get latest report for a village
  app.get("/api/village/:id/reports/latest", (req, res) => {
    const report = getLatestReport(req.params.id);
    if (report) {
      res.json(report);
    } else {
      res.status(404).json({ error: "No reports found" });
    }
  });

  // Submit a new village report
  app.post("/api/village/report/submit", (req, res) => {
    const { villageId, submittedBy, submitterType, waterStatus, waterDetails, climateStatus, climateDetails, currentChallenges, notes } = req.body;
    
    if (!villageId || !submittedBy) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const report = {
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      villageId,
      reportDate: new Date().toISOString(),
      submittedBy,
      submitterType: submitterType || 'Panchayat',
      waterStatus: waterStatus || 'Good',
      waterDetails: waterDetails || '',
      climateStatus: climateStatus || 'Good',
      climateDetails: climateDetails || '',
      currentChallenges: currentChallenges || [],
      notes: notes || ''
    };

    const added = addVillageReport(report);
    res.json(added);
  });

  // Get infrastructure recommendations for a village
  app.get("/api/village/:id/infrastructure/recommendations", (req, res) => {
    const recommendations = getInfrastructureRecommendations(req.params.id);
    if (recommendations.length === 0) {
      // Generate recommendations if none exist
      const generated = generateInfrastructureRecommendations(req.params.id);
      res.json(generated);
    } else {
      res.json(recommendations);
    }
  });

  // Analyze dumpyard photo and generate recommendations 
  app.post("/api/village/infrastructure/analyze-photo", (req, res) => {
    const { villageId } = req.body;
    
    if (!villageId) {
      return res.status(400).json({ error: "Village ID required" });
    }

    // Mock photo analysis - in production, use computer vision API
    const recommendations = generateInfrastructureRecommendations(villageId);
    res.json(recommendations);
  });

  // Search villages by name
  app.get("/api/village/search", (req, res) => {
    const query = (req.query.q as string || '').toLowerCase();
    const villages = loadVillageList();
    
    const results = villages
      .filter(v => 
        v.village_name.toLowerCase().includes(query) || 
        v.village_id.toLowerCase().includes(query)
      )
      .map(v => ({ id: v.village_id, name: v.village_name }));
    
    res.json(results);
  });

  // Get soil data for a village
  app.get("/api/village/:id/soil-data", (req, res) => {
    const villageId = req.params.id;
    
    // Mock soil data - in production, fetch from database
    const soilDataMap: { [key: string]: any[] } = {
      'V001': [
        {
          region: 'North Zone',
          soilType: 'Black Soil',
          coordinates: [14.04, 76.18],
          crops: ['Cotton', 'Sugarcane', 'Jowar'],
          pH: 7.2,
          fertility: 'High',
          waterRetention: 'High',
          organicMatter: 3.5,
          nitrogen: 245,
          phosphorus: 18,
          potassium: 182
        },
        {
          region: 'East Zone',
          soilType: 'Red Soil',
          coordinates: [14.03, 76.20],
          crops: ['Groundnuts', 'Pulses', 'Millets'],
          pH: 6.5,
          fertility: 'Medium',
          waterRetention: 'Medium',
          organicMatter: 2.1,
          nitrogen: 180,
          phosphorus: 12,
          potassium: 145
        },
        {
          region: 'South Zone',
          soilType: 'Alluvial Soil',
          coordinates: [14.02, 76.19],
          crops: ['Rice', 'Wheat', 'Sugarcane'],
          pH: 6.8,
          fertility: 'High',
          waterRetention: 'High',
          organicMatter: 4.2,
          nitrogen: 320,
          phosphorus: 22,
          potassium: 210
        },
        {
          region: 'West Zone',
          soilType: 'Sandy Soil',
          coordinates: [14.03, 76.17],
          crops: ['Groundnuts', 'Millets', 'Castor'],
          pH: 7.0,
          fertility: 'Low',
          waterRetention: 'Low',
          organicMatter: 1.2,
          nitrogen: 95,
          phosphorus: 8,
          potassium: 78
        }
      ],
      'V002': [
        {
          region: 'North Zone',
          soilType: 'Laterite Soil',
          coordinates: [14.05, 76.21],
          crops: ['Coconut', 'Cashew', 'Arecanut'],
          pH: 5.5,
          fertility: 'Medium',
          waterRetention: 'High',
          organicMatter: 2.8,
          nitrogen: 210,
          phosphorus: 14,
          potassium: 165
        },
        {
          region: 'Central Zone',
          soilType: 'Clayey Soil',
          coordinates: [14.04, 76.22],
          crops: ['Rice', 'Cotton', 'Sugarcane'],
          pH: 6.2,
          fertility: 'Medium',
          waterRetention: 'High',
          organicMatter: 3.1,
          nitrogen: 265,
          phosphorus: 19,
          potassium: 195
        }
      ],
      'V003': [
        {
          region: 'North Zone',
          soilType: 'Red Soil',
          coordinates: [14.06, 76.23],
          crops: ['Jowar', 'Pulses', 'Groundnuts'],
          pH: 6.4,
          fertility: 'Medium',
          waterRetention: 'Medium',
          organicMatter: 2.3,
          nitrogen: 195,
          phosphorus: 13,
          potassium: 155
        },
        {
          region: 'South Zone',
          soilType: 'Sandy Soil',
          coordinates: [14.05, 76.24],
          crops: ['Millets', 'Castor', 'Groundnuts'],
          pH: 7.1,
          fertility: 'Low',
          waterRetention: 'Low',
          organicMatter: 1.1,
          nitrogen: 88,
          phosphorus: 7,
          potassium: 72
        }
      ]
    };

    const soilData = soilDataMap[villageId] || soilDataMap['V001'];
    res.json({
      villageId,
      soilZones: soilData,
      totalZones: soilData.length,
      averageFertility: soilData.reduce((sum, s) => {
        const fertilityValue = s.fertility === 'High' ? 3 : s.fertility === 'Medium' ? 2 : 1;
        return sum + fertilityValue;
      }, 0) / soilData.length,
      lastUpdated: new Date().toISOString()
    });
  });

  // Get terrain analysis for a village
  app.get("/api/village/:id/terrain-analysis", (req, res) => {
    const villageId = req.params.id;
    
    const terrainAnalysis = {
      villageId,
      elevation: 650,
      slope: 'Gentle (2-5%)',
      drainageClass: 'Well Drained',
      vegetationType: 'Agricultural',
      landUseClasses: [
        { class: 'Agricultural Land', percentage: 65, area: 520 },
        { class: 'Settlement', percentage: 15, area: 120 },
        { class: 'Forest', percentage: 12, area: 96 },
        { class: 'Rangeland', percentage: 8, area: 64 }
      ],
      erosionRisk: {
        high: { percentage: 5, area: 40 },
        medium: { percentage: 15, area: 120 },
        low: { percentage: 80, area: 640 }
      },
      waterAvailability: {
        groundwater: 'Moderate (35-40m)',
        surfaceWater: 'Yes - Seasonal streams',
        rainwater: 'Good potential for harvesting'
      }
    };

    res.json(terrainAnalysis);
  });

  // ===== Government Schemes Endpoints =====
  
  // Get recommended schemes for a village
  app.get("/api/village/:id/schemes", (req, res) => {
    const villageId = req.params.id;
    const currentCrop = req.query.crop as string | undefined;
    const villages = loadVillageList();
    const village = villages.find(v => v.village_id === villageId);
    
    if (!village) {
      return res.status(404).json({ error: `Village ${villageId} not found` });
    }

    // Construct village state from available data
    const villageState: VillageState = {
      population: village.population || 0,
      households: village.households || 0,
      groundwater_index: village.groundwater_level_initial 
        ? Math.max(0, 1 - (Math.max(0, village.groundwater_level_initial - 5) / 30))
        : 0.5,
      water_risk: village.groundwater_level_initial && village.groundwater_level_initial < 10 
        ? "High" 
        : village.groundwater_level_initial && village.groundwater_level_initial < 20 
        ? "Medium" 
        : "Low",
      flood_prone: false, // Would come from detailed metadata
      main_crops: village.main_crop ? [village.main_crop] : [],
      income_level_approx: "Low", // Would come from detailed metadata
      existing_infra: []
    };

    try {
      const recommendations = recommendSchemesForVillage(villageId, villageState, currentCrop);
      
      // Check if there's a BASE version (user-provided dataset)
      const baseRecommendations = recommendSchemesForVillage(`${villageId}_BASE`, villageState, currentCrop);
      
      let response: any = {
        villageId,
        villageName: village.village_name,
        villageState,
        recommendations,
        totalSchemes: recommendations.length,
        generatedAt: new Date().toISOString()
      };

      // Add separate datasets if both exist
      if (baseRecommendations.length > 0 && recommendations.length > 0) {
        response = {
          villageId,
          villageName: village.village_name,
          villageState,
          datasets: {
            provided_dataset: {
              name: "User-Provided Dataset",
              description: "Schemes from the user-provided JSON file",
              source: "user_dataset",
              schemes: baseRecommendations,
              totalSchemes: baseRecommendations.length,
              totalRecommended: baseRecommendations.filter(s => s.priority === "High" || s.priority === "Medium").length
            },
            extended_dataset: {
              name: "Extended Dataset",
              description: "Enhanced scheme list with additional programs",
              source: "extended_dataset",
              schemes: recommendations,
              totalSchemes: recommendations.length,
              totalRecommended: recommendations.filter(s => s.priority === "High" || s.priority === "Medium").length
            }
          },
          generatedAt: new Date().toISOString()
        };
      } else if (recommendations.length === 0) {
        return res.status(404).json({ 
          error: `No schemes found for village ${villageId}`,
          available_villages: ["NARSING_BATLA", "NARSING_BATLA_BASE", "DAMERACHERLA", "V001", "V002", "V003"]
        });
      }

      res.json(response);
    } catch (error) {
      console.error(`Error getting schemes for ${villageId}:`, error);
      res.status(500).json({ error: "Failed to compute recommendations" });
    }
  });

  // Get schemes by dataset type (user_dataset or extended_dataset)
  app.get("/api/village/:id/schemes/:dataset", (req, res) => {
    const villageId = req.params.id;
    const datasetType = req.params.dataset; // "base" or "extended"
    const currentCrop = req.query.crop as string | undefined;
    const villages = loadVillageList();
    const village = villages.find(v => v.village_id === villageId);
    
    if (!village) {
      return res.status(404).json({ error: `Village ${villageId} not found` });
    }

    const villageState: VillageState = {
      population: village.population || 0,
      households: village.households || 0,
      groundwater_index: village.groundwater_level_initial 
        ? Math.max(0, 1 - (Math.max(0, village.groundwater_level_initial - 5) / 30))
        : 0.5,
      water_risk: village.groundwater_level_initial && village.groundwater_level_initial < 10 
        ? "High" 
        : village.groundwater_level_initial && village.groundwater_level_initial < 20 
        ? "Medium" 
        : "Low",
      flood_prone: false,
      main_crops: village.main_crop ? [village.main_crop] : [],
      income_level_approx: "Low",
      existing_infra: []
    };

    try {
      const lookupId = datasetType === "base" ? `${villageId}_BASE` : villageId;
      const recommendations = recommendSchemesForVillage(lookupId, villageState, currentCrop);
      
      if (recommendations.length === 0) {
        return res.status(404).json({ 
          error: `No ${datasetType} dataset found for village ${villageId}`
        });
      }

      res.json({
        villageId,
        villageName: village.village_name,
        dataset: datasetType,
        datasetName: datasetType === "base" ? "User-Provided Dataset" : "Extended Dataset",
        villageState,
        recommendations,
        totalSchemes: recommendations.length,
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error getting schemes for ${villageId}:`, error);
      res.status(500).json({ error: "Failed to compute recommendations" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
