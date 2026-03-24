# Quick Translation Reference

## Setup ✓ Done

The app now has:
- ✓ 5 languages supported (English, Hindi, Tamil, Marathi, Gujarati)
- ✓ Language persistence (localStorage)
- ✓ Language switcher in header
- ✓ All main UI text translated

## Common Tasks

### Use Translation in a New Component

```typescript
import { useTranslation } from '../hooks/useTranslation';

export function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('nav.dashboard')}</h1>
      <p>{t('dashboard.population')}</p>
    </div>
  );
}
```

### Add a New Translation Key

1. Add to `src/i18n/en.json`:
```json
{
  "mySection": {
    "myKey": "English text here"
  }
}
```

2. Add same key to all other language files:
   - `src/i18n/hi.json`
   - `src/i18n/ta.json`
   - `src/i18n/mr.json`
   - `src/i18n/gu.json`

3. Use in component:
```typescript
const { t } = useTranslation();
t('mySection.myKey')
```

### Get Current Language

```typescript
import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

const { language, setLanguage } = useContext(LanguageContext)!;
console.log(language); // 'en', 'hi', 'ta', 'mr', or 'gu'

// Change language
setLanguage('hi');
```

## Key Translation Patterns

| Pattern | Usage |
|---------|-------|
| `t('nav.map')` | Navigation labels |
| `t('dashboard.simulationScenarios')` | Section titles |
| `t('dashboard.below_normal')` | Status/option values |
| `t('footer.copyright')` | Footer text |

## Supported Languages

| Code | Language | Native Name |
|------|----------|-------------|
| `en` | English | English |
| `hi` | Hindi | हिन्दी |
| `ta` | Tamil | தமிழ் |
| `mr` | Marathi | मराठी |
| `gu` | Gujarati | ગુજરાતી |

## Don't Forget!

When adding new features:
1. ✓ Add English text to `en.json`
2. ✓ Add translations to ALL other language files
3. ✓ Use `t()` hook to display text
4. ✓ Test in all languages

## Files Modified

- `src/main.tsx` - Added LanguageProvider wrapper
- `src/App.tsx` - Updated to use translations
- `src/components/Dashboard.tsx` - Updated to use translations
- All text now dynamic and translatable!

## Helpful Resources

- **Guide**: See `MULTILINGUAL_GUIDE.md`
- **Translation Context**: `src/contexts/LanguageContext.tsx`
- **Translation Hook**: `src/hooks/useTranslation.ts`
- **Language Files**: `src/i18n/*.json`
