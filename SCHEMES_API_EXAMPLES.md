# Government Schemes API - Example Outputs

## Overview
The `/api/village/{village_id}/schemes` endpoint recommends government schemes for villages based on eligibility criteria.

---

## Example 1: NARSING_BATLA (Water Risk = Medium, Income Level = Low)

### Request
```
GET http://localhost:3000/api/village/NARSING_BATLA/schemes
```

### Response
```json
{
  "villageId": "NARSING_BATLA",
  "villageName": "Narsing Batla",
  "villageState": {
    "population": 4236,
    "households": 1070,
    "groundwater_index": 0.567,
    "water_risk": "Medium",
    "flood_prone": false,
    "main_crops": ["Paddy"],
    "income_level_approx": "Low",
    "existing_infra": []
  },
  "recommendations": [
    {
      "scheme_name": "Jal Jeevan Mission",
      "category": "water",
      "status": "implemented",
      "priority": "High",
      "reason": "Critical water need: water-risk is Medium, groundwater under pressure",
      "eligibility_score": 0.95
    },
    {
      "scheme_name": "MGNREGA",
      "category": "employment",
      "status": "active",
      "priority": "High",
      "reason": "Low income communities need employment support",
      "eligibility_score": 0.9
    },
    {
      "scheme_name": "PMAY-G",
      "category": "housing",
      "status": "surveyed",
      "priority": "Medium",
      "reason": "Medium-sized village (1070 households), moderate housing needs",
      "eligibility_score": 0.7
    }
  ],
  "totalSchemes": 3,
  "generatedAt": "2026-03-28T10:45:32.123Z"
}
```

### Key Insights for NARSING_BATLA:
- **Jal Jeevan Mission (Highest Priority)**: Water management is critical. Groundwater index at 0.567 + Medium water risk triggers highest eligibility (0.95)
- **MGNREGA (High Priority)**: Low income level means employment opportunities are crucial (0.9 score)
- **PMAY-G (Medium Priority)**: 1,070 households qualifies for housing development support (0.7 score)

---

## Example 2: DAMERACHERLA (Mixed Agriculture, Medium Income)

### Request
```
GET http://localhost:3000/api/village/DAMERACHERLA/schemes
```

### Response
```json
{
  "villageId": "DAMERACHERLA",
  "villageName": "Dameracherla",
  "villageState": {
    "population": 3500,
    "households": 875,
    "groundwater_index": 0.62,
    "water_risk": "Medium",
    "flood_prone": false,
    "main_crops": ["Groundnuts"],
    "income_level_approx": "Low",
    "existing_infra": []
  },
  "recommendations": [
    {
      "scheme_name": "Jal Jeevan Mission",
      "category": "water",
      "status": "surveyed",
      "priority": "High",
      "reason": "Critical water need: water-risk is Medium",
      "eligibility_score": 0.95
    },
    {
      "scheme_name": "Pradhan Mantri Krishi Sinchayee Yojana",
      "category": "agriculture",
      "status": "implemented",
      "priority": "Medium",
      "reason": "Agricultural community (crops: Groundnuts)",
      "eligibility_score": 0.8
    },
    {
      "scheme_name": "MGNREGA",
      "category": "employment",
      "status": "active",
      "priority": "High",
      "reason": "Low income communities need employment support",
      "eligibility_score": 0.9
    }
  ],
  "totalSchemes": 3,
  "generatedAt": "2026-03-28T10:45:32.456Z"
}
```

### Key Insights for DAMERACHERLA:
- **Jal Jeevan Mission (Highest Priority)**: Medium water risk + groundwater pressure = critical need (0.95)
- **MGNREGA (High Priority)**: Low income = employment support essential (0.9)
- **PMAY (Not Recommended)**: Only 875 households - below medium village threshold
- **Agriculture Support (Medium)**: Groundnut farming community benefits from irrigation schemes (0.8)

---

## Example 3: V001 (Large Village, Stable Water)

### Request
```
GET http://localhost:3000/api/village/V001/schemes
```

### Response
```json
{
  "villageId": "V001",
  "villageName": "Village V001",
  "villageState": {
    "population": 5200,
    "households": 1300,
    "groundwater_index": 0.75,
    "water_risk": "Low",
    "flood_prone": false,
    "main_crops": ["Cotton"],
    "income_level_approx": "Low",
    "existing_infra": []
  },
  "recommendations": [
    {
      "scheme_name": "MGNREGA",
      "category": "employment",
      "status": "active",
      "priority": "High",
      "reason": "Low income communities need employment support",
      "eligibility_score": 0.9
    },
    {
      "scheme_name": "PMAY-G",
      "category": "housing",
      "status": "active",
      "priority": "High",
      "reason": "Large village (1300 households) needs housing development",
      "eligibility_score": 0.85
    },
    {
      "scheme_name": "Jal Jeevan Mission",
      "category": "water",
      "status": "implemented",
      "priority": "Medium",
      "reason": "Water situation is stable, lower priority",
      "eligibility_score": 0.5
    }
  ],
  "totalSchemes": 3,
  "generatedAt": "2026-03-28T10:45:32.789Z"
}
```

### Key Insights for V001:
- **PMAY-G (High Priority)**: 1,300 households is large - housing development critical (0.85)
- **MGNREGA (High Priority)**: Low income - employment support essential (0.9)
- **Jal Jeevan Mission (Medium)**: Groundwater stable (0.75 index) + Low water risk = lower priority (0.5)

---

## Eligibility Scoring Rules

### Water Schemes (category = "water")
- **High Priority (0.95)**: Water Risk = High/Medium OR groundwater_index < 0.6
- **Low Priority (0.5)**: Water Risk = Low AND groundwater_index ≥ 0.6
- **Reason**: Emphasizes critical water management needs

### Employment Schemes (category = "employment")
- **High Priority (0.9)**: income_level_approx = "Low"
- **Medium Priority (0.6)**: income_level_approx = "Medium"
- **Low Priority (0.3)**: income_level_approx = "High"
- **Reason**: Targets economically vulnerable populations

### Housing Schemes (category = "housing")
- **High Priority (0.85)**: households > 2000
- **Medium Priority (0.7)**: 1000 < households ≤ 2000
- **Low Priority (0.4)**: households ≤ 1000
- **Reason**: Prioritizes larger communities with greater housing needs

### Agriculture Schemes (category = "agriculture")
- **Medium Priority (0.8)**: Village has documented main_crops
- **Low Priority (0.3)**: No agricultural activity
- **Reason**: Supports farming communities

### Health Schemes (category = "health")
- **Medium Priority (0.75 or 0.6)**: Based on population size
- **Reason**: Universal health coverage with scaling for larger populations

---

## Integration with Existing GramTwin Data

The schemes recommendation system integrates with existing village metadata:

```typescript
// From CSV loader:
- population
- households
- livestock
- main_crop
- groundwater_level_initial
- state, district

// Converted to VillageState:
{
  population: number,
  households: number,
  groundwater_index: 0-1 (derived from groundwater level),
  water_risk: "High" | "Medium" | "Low",
  main_crops: string[],
  income_level_approx: "Low" | "Medium" | "High",
  existing_infra: string[]
}
```

---

## API Response Structure

```typescript
{
  villageId: string,              // Village identifier
  villageName: string,            // Village name from metadata
  villageState: VillageState,     // Computed village characteristics
  recommendations: [
    {
      scheme_name: string,        // Name of scheme
      category: string,           // water, employment, housing, agriculture, health
      status: string,             // active, implemented, surveyed, pending
      priority: string,           // High, Medium, Low
      reason: string,             // Human-readable eligibility explanation
      eligibility_score: number   // 0-1 decimal score
    }
  ],
  totalSchemes: number,           // Count of recommended schemes
  generatedAt: ISO8601 string     // Timestamp
}
```

---

## Testing the Endpoint

```bash
# Test for NARSING_BATLA
curl "http://localhost:3000/api/village/NARSING_BATLA/schemes"

# Test for DAMERACHERLA
curl "http://localhost:3000/api/village/DAMERACHERLA/schemes"

# Test for V001
curl "http://localhost:3000/api/village/V001/schemes"

# Test for V002
curl "http://localhost:3000/api/village/V002/schemes"

# Test for V003
curl "http://localhost:3000/api/village/V003/schemes"
```

---

## Available Schemes by Category

### Water & Infrastructure
- Jal Jeevan Mission (drinking water)
- Pradhan Mantri Krishi Sinchayee Yojana (irrigation)

### Employment & Livelihood
- MGNREGA (rural employment)

### Housing
- PMAY-G (Pradhan Mantri Awas Yojana - Gramin)

### Health
- ICDS (Integrated Child Development Services)

### Agriculture
- Pradhan Mantri Krishi Sinchayee Yojana (irrigation)
- Various crop-support schemes

---

## Future Enhancements

1. **Dynamic Village State**: Pull from database or ML predictions
2. **Custom Eligibility Rules**: Admin panel to configure thresholds
3. **Scheme Status Tracking**: Monitor implementation progress
4. **Beneficiary Data**: Track number of beneficiaries per scheme
5. **Seasonal Adjustments**: Adjust recommendations based on season
6. **Success Metrics**: Track scheme outcomes in villages
