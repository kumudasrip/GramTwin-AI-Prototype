# GramTwin AI - Multilingual System Guide

## Overview

The GramTwin AI application now supports 5 languages:
- **English** (en)
- **Hindi** (hi) - हिन्दी
- **Tamil** (ta) - தமிழ்
- **Marathi** (mr) - मराठी
- **Gujarati** (gu) - ગુજરાતી

## Architecture

### File Structure

```
src/
├── i18n/
│   ├── en.json          # English translations
│   ├── hi.json          # Hindi translations
│   ├── ta.json          # Tamil translations
│   ├── mr.json          # Marathi translations
│   ├── gu.json          # Gujarati translations
│   └── index.ts         # Translation configuration & utilities
├── hooks/
│   └── useTranslation.ts  # Translation hook for React components
├── contexts/
│   └── LanguageContext.tsx # Language context provider
└── components/
    └── LanguageSwitcher.tsx # Language selector UI component
```

### How It Works

1. **LanguageProvider** (in `LanguageContext.tsx`)
   - Wraps the entire application
   - Manages current language state
   - Persists language preference to localStorage

2. **useTranslation Hook** (in `hooks/useTranslation.ts`)
   - Used in components to access translations
   - Provides `t()` function for translating keys
   - Example: `t('nav.map')` → returns "Map" (en) or "नक्शा" (hi)

3. **LanguageSwitcher Component** (in `components/LanguageSwitcher.tsx`)
   - Dropdown menu to select language
   - Displays in header navigation
   - Automatically updates entire app

## Translation Key Structure

Translations are organized in a nested JSON structure:

```json
{
  "common": { ... },
  "nav": { ... },
  "map": { ... },
  "dashboard": { ... },
  "footer": { ... }
}
```

## Using Translations in Components

### Basic Usage

```typescript
import { useTranslation } from '../hooks/useTranslation';

export function MyComponent() {
  const { t } = useTranslation();
  
  return <h1>{t('nav.dashboard')}</h1>;
}
```

### Accessing Language Information

```typescript
import { useTranslation } from '../hooks/useTranslation';
import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

export function LanguageInfo() {
  const { t } = useTranslation();
  const { language, setLanguage } = useContext(LanguageContext)!;
  
  return (
    <div>
      <p>Current language: {language}</p>
      <button onClick={() => setLanguage('hi')}>
        {t('nav.map')}
      </button>
    </div>
  );
}
```

## Adding New Translations

### Step 1: Add to English Translation File

Edit `src/i18n/en.json`:

```json
{
  "newFeature": {
    "title": "My New Feature",
    "description": "Feature description"
  }
}
```

### Step 2: Add to All Language Files

Add the same structure to:
- `src/i18n/hi.json` (Hindi)
- `src/i18n/ta.json` (Tamil)
- `src/i18n/mr.json` (Marathi)
- `src/i18n/gu.json` (Gujarati)

Example for Hindi:

```json
{
  "newFeature": {
    "title": "मेरी नई सुविधा",
    "description": "सुविधा विवरण"
  }
}
```

### Step 3: Use in Components

```typescript
const { t } = useTranslation();

<h1>{t('newFeature.title')}</h1>
<p>{t('newFeature.description')}</p>
```

## Language Persistence

- Language preference is automatically saved to browser's localStorage
- When users return to the app, their last selected language is restored
- Key used: `'language'` in localStorage

## Supported Translation Keys

### Navigation (`nav`)
- `map` - Map
- `dashboard` - Dashboard
- `soilCrops` - Soil & Crops
- `reports` - Reports
- `infrastructure` - Infrastructure
- `gramtwinAI` - GramTwin AI

### Map Page (`map`)
- `selectVillage` - Select Village
- `selectedVillage` - Selected Village
- `population` - Population
- `mainCrop` - Main Crop
- `waterLevel` - Water Level
- `viewAnalytics` - View Analytics

### Dashboard (`dashboard`)
- `selectVillage` - Select Village
- `dataSource` - Data Source
- `censusIMD` - Census & IMD Historical Data
- `simulationScenarios` - Simulation Scenarios
- `historicalRainfall` - Historical Rainfall (Last 12 months)
- `rainfallForecast` - Rainfall Forecast
- `population` - Population
- `mainCrop` - Main Crop
- `groundwater` - Groundwater
- `live` - Live
- `waterRiskTimeline` - Water Risk Timeline
- `cropRecommendations` - Crop Recommendations
- `month` - Month
- `waterStock` - Water Stock
- `riskLevel` - Risk Level
- `crop` - Crop
- `suitability` - Suitability
- `reason` - Reason
- `executeSimulation` - Execute Simulation
- `processingSimulation` - Processing Simulation...
- `intelligence` - Intelligence
- `description` - (Long description text)
- `below_normal` - Below normal
- `normal` - Normal
- `above_normal` - Above normal
- `excellent` - Excellent
- `good` - Good
- `moderate` - Moderate
- `stressed` - Stressed
- `critical` - Critical
- `district` - District
- `state` - State
- `low` - Low
- `medium` - Medium
- `high` - High
- `loadingVillageProfile` - Loading village profile...

### Footer (`footer`)
- `copyright` - © 2026 GramTwin AI. Empowering Rural India.
- `waterSecurity` - Water Security
- `climateAdaptation` - Climate Adaptation
- `ruralDevelopment` - Rural Development

### Common (`common`)
- `loading` - Loading...
- `processing` - Processing...
- `error` - An error occurred
- `success` - Success
- `search` - Search
- `select` - Select

## Best Practices

1. **Always use translation keys** - Never hardcode UI text in English
2. **Keep keys hierarchical** - Use dots to organize by feature area
3. **Use descriptive key names** - Make it clear what text the key represents
4. **Test all languages** - Ensure translations work in all supported languages
5. **Update all files** - When adding translations, update ALL language files
6. **Use context cautiously** - For simple cases, use the `t()` function only

## Updating the Language Switcher Position

The LanguageSwitcher is currently positioned in the header. To move it:

Edit `src/App.tsx` and modify the header section:

```typescript
<nav className="flex items-center gap-2 ml-auto">
  {/* Navigation buttons */}
  <div className="ml-4 pl-4 border-l border-zinc-200">
    <LanguageSwitcher />
  </div>
</nav>
```

## Troubleshooting

### Translation key not updating
- Ensure the component is wrapped with `LanguageProvider` in `main.tsx`
- Check that the key exists in ALL language files
- Verify correct key path (e.g., `dashboard.simulationScenarios`)

### LanguageSwitcher not showing
- Make sure `<LanguageSwitcher />` is imported in the component
- Verify it's placed inside a component that can use `useContext`

### Language not persisting
- Check browser's localStorage is enabled
- Verify the key `'language'` is being set correctly
- Clear localStorage and try selecting language again

## Future Enhancements

1. Add more languages (e.g., Bengali, Telugu, Kannada)
2. Implement right-to-left (RTL) language support
3. Add translation keys for error messages
4. Create translation management dashboard
5. Add language auto-detection based on browser settings
6. Implement lazy loading of translation files for better performance

## Contributing Translations

To contribute new language translations:

1. Create a new JSON file in `src/i18n/` (e.g., `bn.json` for Bengali)
2. Copy the structure from `en.json`
3. Translate all text to the target language
4. Update `src/i18n/index.ts` to include the new language:

```typescript
import bn from './bn.json';

export const translations = {
  en,
  hi,
  ta,
  mr,
  gu,
  bn  // Add here
} as const;

export const LANGUAGES = [
  // ... existing languages
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' }
];
```

5. Submit a pull request with the new translations

