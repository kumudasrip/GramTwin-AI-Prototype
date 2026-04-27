# GramTwin AI

GramTwin AI is a village-scale digital twin prototype for rural planning. It combines village data, water simulation, crop guidance, government-scheme recommendations, and map-based inspection in one app.

## What Changed

### Backend performance
- Added in-memory caching in server/cache.ts
- Cached CSV and GeoJSON loads so repeated requests do not reread files
- Cached identical simulation inputs in server/simulation.ts
- Ran best-action scenario simulations in parallel with Promise.all

### Backend cleanup
- Centralized shared risk logic in server/services/risk.ts
- Centralized advisor/action-plan logic in server/services/advisorRecommendations.ts
- Kept agents thin and orchestration-focused

### Auth and startup flow
- App now starts on the login page instead of restoring the previous session
- AuthContext no longer rehydrates from localStorage on load

### UI updates already in the app
- Login, dashboard, map, reports, citizen queries, post query, infrastructure, farmer planning, and schemes screens were tightened for smaller screens
- App layout now avoids horizontal overflow more aggressively
- Several icon and spacing adjustments were made across the frontend for readability

### Documentation cleanup
- The extra root markdown docs were consolidated into this README
- The old standalone markdown files were removed to keep the repo focused on one source of truth

## Run the Project

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Core Tech Stack
- Frontend: React, TypeScript, Vite, Leaflet
- Backend: Express, TypeScript, tsx
- Data: CSV and GeoJSON under data/

## Main Features

### Village exploration
- Search and select villages
- View baseline village metadata
- Inspect geo layers for villages, fields, wells, and flood-prone zones

### Simulation engine
- Simulates short-term water stock changes
- Uses rainfall, population, and crop inputs
- Returns crop recommendations and water-risk timelines

### Best-action advisor
- Compares intervention scenarios
- Evaluates crop switching, irrigation reduction, and rainfall improvement
- Picks the strongest outcome by risk and water stock

### Government schemes
- Recommends schemes from village state and crop context
- Supports water, employment, housing, agriculture, and health categories

### Multilingual support
- Supports English, Hindi, Tamil, Marathi, and Gujarati in the main app language system
- Translation data lives in src/i18n/

### Login flow
- The app uses the new dual-mode login flow
- Citizen access is read-only
- Organization access has full feature access

## Architecture

- server.ts wires the API and frontend dev server
- server/ contains simulation, data loading, geo loading, and agent orchestration
- server/services/ contains shared logic used by multiple backend entry points
- src/ contains the React frontend
- data/ contains village CSV files and GeoJSON assets

## API Endpoints

- GET /api/village/list
- GET /api/village/:id/baseline
- GET /api/rainfall/:id
- POST /api/village/simulate
- POST /api/village/simulate/best-action
- GET /api/village/last_simulation
- GET /api/village/alerts
- GET /api/geo/villages
- GET /api/geo/village/:id/fields
- GET /api/geo/village/:id/wells
- GET /api/geo/village/:id/flood_risk

## Simulation Model

- Initial water stock starts at 100
- Domestic demand is population multiplied by the configured monthly factor
- Irrigation demand is crop-specific
- Recharge depends on rainfall category
- Risk bands are Low, Medium, and High based on resulting stock

## Login Flow

The login system is a dual-mode entry point:
- Citizen mode gives read-only access to the app
- Organization mode unlocks editing and reporting features

The app now opens on login first, which matches the current auth behavior in the context provider.

## Multilingual System

The app includes a lightweight translation setup without external i18n libraries.

Supported languages:
- English
- Hindi
- Tamil
- Marathi
- Gujarati

The language switcher and translation hook are already wired into the frontend app.

## Government Schemes Logic

The scheme recommender uses village state to estimate fit and priority.

Categories covered:
- Water and infrastructure
- Employment and livelihood
- Housing
- Health
- Agriculture

## Example Integration

The repository also includes an example app integration file at example-app-integration.tsx that shows how the login and role-based flow are wired together.

## Removed Docs

These files were consolidated into this README and removed from the root:
- changes-summary.md
- implementation-summary.md
- login-documentation.md
- multilingual-guide.md
- new-login-integration.md
- new-login-readme.md
- schemes-api-examples.md
- translation-quick-reference.md
- usage-examples.md

## Notes

- The dev server is started with npm run dev
- The app listens on http://localhost:3000
- If the port is already in use, an older dev server process is still running
