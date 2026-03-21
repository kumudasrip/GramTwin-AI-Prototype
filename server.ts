import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { simulateVillage, getBaselineData, getLatestAlerts, getLastSimulation } from "./server/simulation.ts";
import { loadVillageList, loadRainfallData } from "./server/data/csv_loader.ts";
import { loadGeoJSON } from "./server/geo_loader.ts";

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
