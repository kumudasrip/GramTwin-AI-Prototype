import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { simulateVillage, getBaselineData, getLatestAlerts, getLastSimulation } from "./server/simulation.ts";
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

  app.post("/api/village/simulate", (req, res) => {
    const result = simulateVillage(req.body);
    res.json(result);
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
