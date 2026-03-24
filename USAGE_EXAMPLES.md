# Multilingual System - Usage Examples

## Example 1: Simple Component Translation

**Before (English-only):**
```typescript
export function Dashboard() {
  return (
    <div>
      <h2>Select Village</h2>
      <p>Population</p>
      <p>Main Crop</p>
      <button>View Analytics</button>
    </div>
  );
}
```

**After (Multilingual):**
```typescript
import { useTranslation } from '../hooks/useTranslation';

export function Dashboard() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h2>{t('dashboard.selectVillage')}</h2>
      <p>{t('dashboard.population')}</p>
      <p>{t('dashboard.mainCrop')}</p>
      <button>{t('map.viewAnalytics')}</button>
    </div>
  );
}
```

**Result:**
- English: "Select Village", "Population", "Main Crop", "View Analytics"
- Hindi: "गांव चुनें", "जनसंख्या", "मुख्य फसल", "विश्लेषण देखें"
- Tamil: "கிராமத்தைத் தேர்ந்தெடு", "மக்கள்தொகை", "முக்கிய பயிர்", "பகுப்பாய்வு பார்க்கவும்"
- Marathi: "गाव निवडा", "लोकसंख्या", "मुख्य पीक", "विश्लेषण पहा"
- Gujarati: "ગામ પસંદ કરો", "વસ્તી", "મુખ્ય પાક", "વિશ્લેષણ જુઓ"

## Example 2: Language-Aware Dropdown

```typescript
import { useTranslation } from '../hooks/useTranslation';

export function RainfallSelector() {
  const { t } = useTranslation();
  
  return (
    <select>
      <option value="below">{t('dashboard.below_normal')}</option>
      <option value="normal">{t('dashboard.normal')}</option>
      <option value="above">{t('dashboard.above_normal')}</option>
    </select>
  );
}
```

**Rendering in different languages:**
- English: "Below normal", "Normal", "Above normal"
- Hindi: "सामान्य से नीचे", "सामान्य", "सामान्य से अधिक"
- Tamil: "சாதாரணத்திற்கு கீழ்", "சாதாரணம்", "சாதாரணத்திற்கு மேல்"

## Example 3: Getting Current Language

```typescript
import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import { LANGUAGES } from '../i18n';

export function LanguageInfo() {
  const context = useContext(LanguageContext);
  
  if (!context) return null;
  
  const { language, setLanguage } = context;
  const currentLang = LANGUAGES.find(l => l.code === language);
  
  return (
    <div>
      <p>Current: {currentLang?.nativeName}</p>
      
      <div>
        {LANGUAGES.map(lang => (
          <button 
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            style={{ 
              fontWeight: language === lang.code ? 'bold' : 'normal' 
            }}
          >
            {lang.nativeName}
          </button>
        ))}
      </div>
    </div>
  );
}
```

## Example 4: Conditional Translations Based on Language

```typescript
import { useTranslation } from '../hooks/useTranslation';
import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

export function GroundwaterStatus({ status }: { status: string }) {
  const { t } = useTranslation();
  const { language } = useContext(LanguageContext)!;
  
  // Get translated status
  const statusKey = `dashboard.${status.toLowerCase()}`;
  const translatedStatus = t(statusKey);
  
  // RTL languages (if added in future)
  const isRTL = language === 'ur'; // Urdu would be RTL
  
  return (
    <div style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <span>Status: {translatedStatus}</span>
    </div>
  );
}
```

## Example 5: Adding Translations for New Feature

**Step 1: Define in en.json**
```json
{
  "weatherAlerts": {
    "title": "Weather Alerts",
    "floodWarning": "Flood Warning Active",
    "droughtRisk": "High Drought Risk",
    "cycloneWatch": "Cyclone Watch"
  }
}
```

**Step 2: Add to all language files (hi.json example)**
```json
{
  "weatherAlerts": {
    "title": "मौसम सतर्कताएं",
    "floodWarning": "बाढ़ की चेतावनी सक्रिय",
    "droughtRisk": "सूखे का उच्च जोखिम",
    "cycloneWatch": "चक्रवात की निगरानी"
  }
}
```

**Step 3: Use in component**
```typescript
import { useTranslation } from '../hooks/useTranslation';

export function WeatherAlerts() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h3>{t('weatherAlerts.title')}</h3>
      <div>{t('weatherAlerts.floodWarning')}</div>
      <div>{t('weatherAlerts.droughtRisk')}</div>
      <div>{t('weatherAlerts.cycloneWatch')}</div>
    </div>
  );
}
```

## Example 6: Pagination with Translated Labels

```typescript
import { useTranslation } from '../hooks/useTranslation';

export function VillageList({ villages, currentPage, onPageChange }) {
  const { t } = useTranslation();
  
  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>{t('dashboard.population')}</th>
            <th>{t('dashboard.mainCrop')}</th>
            <th>{t('dashboard.groundwater')}</th>
          </tr>
        </thead>
        <tbody>
          {villages.map(village => (
            <tr key={village.id}>
              <td>{village.population}</td>
              <td>{village.crop}</td>
              <td>{t(`dashboard.${village.status}`)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div>
        <button onClick={() => onPageChange(currentPage - 1)}>← Previous</button>
        <span>Page {currentPage}</span>
        <button onClick={() => onPageChange(currentPage + 1)}>Next →</button>
      </div>
    </div>
  );
}
```

## Example 7: Error Messages in User's Language

```typescript
import { useTranslation } from '../hooks/useTranslation';

export function SimulationForm() {
  const { t } = useTranslation();
  
  const handleSubmit = async (data) => {
    try {
      const result = await runSimulation(data);
    } catch (error) {
      const errorMessages = {
        'INVALID_VILLAGE': t('errors.invalidVillage'),
        'NETWORK_ERROR': t('errors.networkError'),
        'VALIDATION_ERROR': t('errors.validationError')
      };
      
      alert(errorMessages[error.code] || t('errors.unknown'));
    }
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

## Example 8: Real App Usage - Dashboard Component

```typescript
// From src/components/Dashboard.tsx
const Dashboard: React.FC<DashboardProps> = ({ baseline, simulation, ... }) => {
  const { t } = useTranslation();
  
  const getGroundwaterStatus = (pop: number) => {
    if (pop < 100) return { label: t('dashboard.excellent'), ... };
    if (pop <= 1000) return { label: t('dashboard.good'), ... };
    // ... more status checks
  };
  
  return (
    <div className="space-y-8">
      {/* Select Village Section */}
      <div className="dashboard-card">
        <h2>{t('dashboard.selectVillage')}</h2>
        {/* ... village selector */}
      </div>
      
      {/* Simulation Form */}
      <div className="dashboard-card">
        <h3>{t('dashboard.simulationScenarios')}</h3>
        <form onSubmit={handleSubmit}>
          <label>{t('dashboard.rainfallForecast')}</label>
          <select>
            <option>{t('dashboard.below_normal')}</option>
            <option>{t('dashboard.normal')}</option>
            <option>{t('dashboard.above_normal')}</option>
          </select>
          
          <button>{t('dashboard.executeSimulation')}</button>
        </form>
      </div>
      
      {/* Results Tables */}
      {simulation && (
        <div>
          <table>
            <thead>
              <tr>
                <th>{t('dashboard.month')}</th>
                <th>{t('dashboard.waterStock')}</th>
                <th>{t('dashboard.riskLevel')}</th>
              </tr>
            </thead>
            {/* Table body */}
          </table>
        </div>
      )}
    </div>
  );
};
```

## Example 9: Locale-Specific Number Formatting

```typescript
import { useTranslation } from '../hooks/useTranslation';

export function PopulationDisplay({ population }: { population: number }) {
  const { t } = useTranslation();
  const { language } = useContext(LanguageContext)!;
  
  // Format numbers based on locale
  const formatter = new Intl.NumberFormat(
    language === 'en' ? 'en-US' : `${language}-IN`,
    { notation: 'compact' }
  );
  
  return (
    <p>
      {t('dashboard.population')}: <strong>{formatter.format(population)}</strong>
    </p>
  );
}
```

## Example 10: Dynamic Language Switching with State Persistence

```typescript
import { useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

export function App() {
  const { t } = useTranslation();
  const { language, setLanguage } = useContext(LanguageContext)!;
  
  // Document language attribute for accessibility
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  
  // Load user preferences
  useEffect(() => {
    const savedLanguage = localStorage.getItem('userLanguage');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);
  
  return (
    <div>
      <header>{t('nav.gramtwinAI')}</header>
      {/* ... rest of app */}
    </div>
  );
}
```

## Real Output Examples

### Header Navigation
**English:**
Map | Dashboard | Soil & Crops | Reports | Infrastructure

**Hindi:**
नक्शा | डैशबोर्ड | मिट्टी और फसलें | रिपोर्ट | बुनियादी ढांचा

**Tamil:**
வரைபடம் | டாஷ்போர்ட் | மண் மற்றும் பயிர்கள் | அறிக்கைகள் | உள்ளடக்கமாதல் வசதி

### Status Badges
**English:** Excellent | Good | Moderate | Stressed | Critical

**Hindi:** उत्कृष्ट | अच्छा | मध्यम | तनावग्रस्त | घातक

**Marathi:** उत्कृष्ट | चांगला | मध्यम | तणावग्रस्त | गंभीर

---

These examples demonstrate the flexibility and power of the multilingual system. The same pattern can be applied to any UI element in the application.
