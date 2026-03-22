# GramTwin AI: Village-Scale Digital Twin Prototype

GramTwin AI is a digital twin prototype designed for rural India to simulate village-scale water dynamics and provide actionable agricultural insights.

## Architecture
- **Frontend**: React (TypeScript) + Leaflet for interactive map visualization.
- **Backend**: Node.js/Express (TypeScript) with a simulation engine driven by CSV and GeoJSON data.
- **Data Layer**:
  - `data/villages.csv`: Census-style village demographics.
  - `data/rainfall_*.csv`: Historical monthly rainfall aggregations (IMD-style).
  - `data/geo/*.json`: GeoJSON layers for village boundaries, fields, wells, and flood-risk zones.

## Key Features
1. **Interactive Map**: Visualize village boundaries, crop fields, well health, and flood-risk zones.
2. **Scenario Simulation**: Adjust population, crop types, and rainfall forecasts to project water stock over 3 months.
3. **Smart Recommendations**: Get crop-switching advice and water-saving alerts based on simulation outcomes.
4. **Data-Driven Insights**: Driven by local CSV data, ensuring transparency and reproducibility.

## How to Run
1. The project is configured for a full-stack environment.
2. The backend runs on port 3000 (standard for this environment).
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open the application in your browser.

## Demo Script
1. **Explore the Map**: Select a village (e.g., Holalkere) from the directory or by clicking on the map.
2. **Analyze Baseline**: View the village's population, main crop, and historical rainfall trend.
3. **Run Simulation**: Go to the Dashboard, adjust the scenario (e.g., set Rainfall to "Below normal"), and click **Run Simulation**.
4. **Review Results**: 
   - Check the **Water Risk Timeline** for projected shortages.
   - See **Crop Recommendations** for climate-resilient alternatives.
   - Check the **Alerts** tab for urgent community notifications.
5. **Map Feedback**: Notice how the map boundary highlights in red if the simulation projects a "High" risk.

## Simulation Logic
The simulation uses a water-stock model:
- **Initial Stock**: 100 units (clamped between 0 and 100).
- **Deductions**: 
  - **Domestic**: `population * domestic_water_per_capita_per_month` (from config).
  - **Irrigation**: Crop-specific values (e.g., Paddy: 15, Millets: 5) from config.
- **Recharge**: Based on rainfall forecasts (Below normal, Normal, Above normal) from config.
- **Risk Assessment**:
  - **Low**: Stock >= 70
  - **Medium**: 40 <= Stock < 70
  - **High**: Stock < 40

## Configuration & Scenarios
- **Scenario Config**: Edit `/server/config/default_scenario.json` to change global simulation parameters like water consumption rates or recharge factors.
- **Village Data**: Mock data for multiple villages (Anantapur, Baramati, Chittoor) is available in `/server/data/mock_india_data.ts`.
- **Recommendation Engine**: The app dynamically generates alerts based on the final month's risk level, suggesting crop shifts or irrigation reductions.

## Example Input
- **Population**: 4500
- **Rainfall Forecast**: "Below normal"
- **Main Crop**: "Paddy"

## Project Structure
- `/server.ts`: Main Express server entry point.
- `/server/`: Backend simulation logic and types.
- `/src/App.tsx`: Main React application.
- `/src/components/`: Reusable UI components (Dashboard, Alerts).
- `/src/api/`: Frontend API client.
