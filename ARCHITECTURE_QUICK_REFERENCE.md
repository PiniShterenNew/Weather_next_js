# 🎯 Architecture Quick Reference

**One-page guide to the Weather App architecture**

---

## 📂 File Organization (Post-Migration)

```
weather-next-js/
├── 🚀 app/                    # Next.js 15 App Router
│   ├── [locale]/              # i18n routing
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── cities/page.tsx    # Cities page
│   └── api/                   # API routes
│       ├── weather/route.ts   # GET /api/weather
│       ├── suggest/route.ts   # GET /api/suggest
│       └── reverse/route.ts   # GET /api/reverse
│
├── 🎯 features/               # FEATURE-BASED (main organization)
│   ├── weather/               # Weather feature
│   ├── search/                # Search feature
│   ├── cities/                # Cities management
│   ├── settings/              # Settings
│   └── quick-add/             # Quick add modal
│
├── 🧩 components/             # SHARED components only
│   ├── layout/                # Header, Navigation
│   ├── feedback/              # Toast, Loading, Offline
│   ├── skeleton/              # Loading skeletons
│   └── ui/                    # shadcn/ui components
│
├── 💾 stores/                 # Global Zustand stores
│   └── useWeatherStore.ts     # Main app state
│
├── 🛠️ lib/                    # Shared utilities
│   ├── helpers.ts             # General helpers
│   ├── utils.ts               # Tailwind utils
│   ├── weatherCache.ts        # Caching layer
│   └── db/                    # Database utilities
│
├── 🎣 hooks/                  # Global custom hooks
├── 📘 types/                  # Global TypeScript types
├── 🌍 i18n/                   # Internationalization
├── 🎨 config/                 # Design tokens
└── 🧪 tests/                  # All tests (mirrored structure)
    ├── unit/
    ├── integration/
    └── e2e/ (separate)
```

---

## 🎯 Feature Structure

Each feature follows this pattern:

```
features/{feature-name}/
├── components/          # Feature-specific UI
├── services/           # API calls & business logic
├── hooks/              # Feature-specific hooks
├── store/              # Feature state (if needed)
├── utils/              # Feature utilities
├── types.ts            # Feature type definitions
└── index.ts            # Barrel export
```

---

## 📦 Import Patterns

```tsx
// ✅ Features (use barrel exports)
import { WeatherCard, CityInfo } from '@/features/weather';
import { SearchBar } from '@/features/search';
import { SettingsModal } from '@/features/settings';

// ✅ Shared components
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { ToastHost } from '@/components/feedback/ToastHost';

// ✅ Stores
import { useWeatherStore } from '@/store/useWeatherStore';

// ✅ Utilities
import { cn } from '@/lib/utils';
import { formatTemp } from '@/lib/helpers';

// ✅ Types
import type { CityWeather } from '@/types/weather';

// ❌ NEVER import from internals
import { WeatherCard } from '@/features/weather/components/WeatherCard'; // ❌
```

---

## 🔄 Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                    User Action                          │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ↓
┌─────────────────────────────────────────────────────────┐
│              React Component                            │
│  • HomePage.tsx                                         │
│  • SearchBar.tsx                                        │
│  • SettingsModal.tsx                                    │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ↓
┌─────────────────────────────────────────────────────────┐
│         Custom Hooks (Optional)                         │
│  • useCityManagement                                    │
│  • useCityRefresh                                       │
│  • useDebounce                                          │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ↓
┌─────────────────────────────────────────────────────────┐
│          Zustand Store Actions                          │
│  • useWeatherStore.addCity()                            │
│  • useWeatherStore.updateCity()                         │
│  • useWeatherStore.setLocale()                          │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ↓
┌─────────────────────────────────────────────────────────┐
│              Service Layer                              │
│  • weatherService.fetchWeather()                        │
│  • searchService.getSuggestions()                       │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ↓
┌─────────────────────────────────────────────────────────┐
│              Cache Layer                                │
│  • Check getCachedWeather()                             │
│  • If miss → continue                                   │
│  • If hit → return cached                               │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ↓
┌─────────────────────────────────────────────────────────┐
│              API Routes                                 │
│  • GET /api/weather?lat=...&lon=...                     │
│  • GET /api/suggest?q=...                               │
│  • GET /api/reverse?lat=...&lon=...                     │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ↓
┌─────────────────────────────────────────────────────────┐
│          External APIs / Database                       │
│  • OpenWeatherMap API                                   │
│  • Prisma Database (Cities)                             │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ↓
┌─────────────────────────────────────────────────────────┐
│              Response Flow                              │
│  API → Cache (save) → Store (update) → Component       │
│                           ↓                             │
│                    Re-render with new data              │
└─────────────────────────────────────────────────────────┘
```

---

## 🏗️ Component Hierarchy

```
app/[locale]/layout.tsx (ROOT)
│
├── ThemeAndDirectionProvider
├── NextIntlClientProvider
├── ToastHost
├── LoadingOverlay
├── OfflineFallback
│
└── PersistentLayout
    │
    ├── Header
    │   ├── Logo
    │   ├── QuickAddTrigger
    │   └── SettingsTrigger
    │
    ├── main (children)
    │   │
    │   └── HomePage (app/[locale]/page.tsx)
    │       │
    │       ├── Mobile View
    │       │   └── CityInfo or EmptyPage
    │       │
    │       └── Desktop View
    │           ├── Sidebar
    │           │   └── WeatherList
    │           │       └── WeatherListItem (×n)
    │           │
    │           └── Main Content
    │               └── CityInfo or EmptyPage
    │                   ├── CityHeader
    │                   ├── WeatherCardContent
    │                   │   ├── WeatherIcon
    │                   │   ├── WeatherDetails
    │                   │   └── WeatherTimeNow
    │                   └── ForecastList
    │                       └── ForecastItem (×5)
    │
    └── BottomNavigation (mobile only)
        └── NavItems (Home, Cities, Add, Settings)
```

---

## 💾 State Management

### useWeatherStore (Global State)

**Persisted State**:
```tsx
{
  cities: CityWeather[],
  currentIndex: number,
  unit: 'metric' | 'imperial',
  locale: 'en' | 'he',
  theme: 'light' | 'dark' | 'system',
  autoLocationCityId?: string
}
```

**Non-Persisted State**:
```tsx
{
  isLoading: boolean,
  toasts: ToastMessage[],
  open: boolean  // Modal state
}
```

**Key Actions**:
```tsx
addCity(city)                    // Add with duplicate check
updateCity(city)                 // Update weather data
removeCity(id)                   // Remove city
refreshCity(id)                  // Force refresh
setUnit(unit)                    // Change temp unit
setLocale(locale)                // Change language
setTheme(theme)                  // Change theme
setCurrentIndex(index)           // Switch active city
showToast(toast)                 // Display notification
```

---

## 🔌 API Endpoints

### Weather API
```
GET /api/weather?lat={lat}&lon={lon}&id={id}

Response: CityWeather
{
  id, lat, lon,
  name: { en, he },
  country: { en, he },
  currentEn: { current, forecast, ... },
  currentHe: { current, forecast, ... },
  lastUpdated
}
```

### Suggest API
```
GET /api/suggest?q={query}

Response: CitySuggestion[]
[
  {
    id, lat, lon,
    city: { en, he },
    country: { en, he }
  }
]
```

### Reverse Geocoding API
```
GET /api/reverse?lat={lat}&lon={lon}

Response: CityInfo
{
  id, lat, lon,
  city: { en, he },
  country: { en, he }
}
```

---

## 🎨 Styling Patterns

### Tailwind Usage
```tsx
// ✅ Use design tokens from config/tokens.ts
import { tokens } from '@/config/tokens';

// ✅ Use cn() utility for conditional classes
import { cn } from '@/lib/utils';

<div className={cn(
  "base-classes",
  condition && "conditional-classes",
  anotherCondition ? "class-a" : "class-b"
)}>

// ✅ Use shadcn/ui components
import { Button } from '@/components/ui/button';
<Button variant="ghost" size="sm">Click</Button>
```

### RTL Support
```tsx
// Direction is set in layout.tsx based on locale
<html lang={locale} dir={direction}>

// Tailwind utilities automatically flip for RTL
className="ml-4"  // becomes margin-right in RTL

// Use logical properties
className="ms-4"  // margin-inline-start (correct for both)
```

---

## 🌍 Internationalization

### Translation Keys
```tsx
// ✅ Use useTranslations hook
import { useTranslations } from 'next-intl';

const t = useTranslations('weather');
<h1>{t('title')}</h1>

// ✅ With parameters
t('temperature', { temp: 25 })
```

### Translation Files
```
locales/
├── en.json    # English translations
└── he.json    # Hebrew translations

Structure:
{
  "weather": {
    "title": "Weather",
    "temperature": "{temp}°"
  },
  "common": { ... },
  "toasts": { ... }
}
```

### Language Switch Flow
```
User clicks language toggle
  ↓
router.push(`/${newLocale}/...`)
  ↓
middleware.ts detects locale
  ↓
layout.tsx loads new locale messages
  ↓
All components re-render with new translations
```

---

## 🧪 Testing Strategy

### Test Organization
```
tests/
├── unit/                    # Unit tests (mirror structure)
│   ├── features/
│   │   ├── weather/
│   │   ├── search/
│   │   └── settings/
│   ├── components/
│   ├── lib/
│   └── stores/
│
├── integration/             # Integration tests
│   ├── weather-flow.test.tsx
│   └── search-flow.test.tsx
│
└── fixtures/                # Test data
    └── weather.ts
```

### Test Commands
```bash
npm run test:unit           # All unit tests
npm run test:integration    # Integration tests
npm run test:e2e           # E2E tests (Playwright)
npm run test:coverage      # Coverage report
```

---

## 🚀 Common Tasks

### Add a New Feature
```bash
# 1. Create feature structure
mkdir -p features/new-feature/{components,services,hooks}
touch features/new-feature/{index.ts,types.ts}

# 2. Create components
# features/new-feature/components/MyComponent.tsx

# 3. Create barrel export
# features/new-feature/index.ts
export * from './components/MyComponent';
export * from './types';

# 4. Create tests
mkdir -p tests/unit/features/new-feature
# tests/unit/features/new-feature/MyComponent.test.tsx

# 5. Import in app
import { MyComponent } from '@/features/new-feature';
```

### Add a New API Route
```bash
# 1. Create route file
mkdir -p app/api/my-endpoint
touch app/api/my-endpoint/route.ts

# 2. Implement handler
export async function GET(request: NextRequest) {
  // Validate input
  // Query database or external API
  // Return response
}

# 3. Create test
touch tests/unit/api/myEndpointRoute.test.ts

# 4. Use in service
// features/my-feature/services/myService.ts
const response = await fetch('/api/my-endpoint?param=value');
```

### Add a New Component
```bash
# Shared component (layout, feedback, etc.)
touch components/layout/MyComponent.tsx
touch tests/unit/components/layout/MyComponent.test.tsx

# Feature-specific component
touch features/my-feature/components/MyComponent.tsx
touch tests/unit/features/my-feature/MyComponent.test.tsx

# shadcn/ui component
npx shadcn-ui@latest add <component-name>
```

---

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Module not found | Check import path uses `@/` alias |
| Circular dependency | Extract shared types to `/types/` |
| Test import error | Use absolute paths: `@/features/...` |
| Build failed | Run `npm run lint` and fix errors |
| Translation missing | Add key to `locales/en.json` and `locales/he.json` |
| Style not applied | Check Tailwind config and class names |
| State not persisting | Check Zustand persist config |
| API error | Check API route exists and input validation |

### Debug Commands
```bash
# Check for broken imports
npm run build

# Check for unused dependencies
npx depcheck

# Check for circular dependencies
npx madge --circular --extensions ts,tsx ./

# Analyze bundle size
npm run build && npx @next/bundle-analyzer

# Type check
npx tsc --noEmit
```

---

## 📊 Performance Tips

1. **Lazy Load Heavy Components**
   ```tsx
   const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
     loading: () => <Skeleton />,
     ssr: false
   });
   ```

2. **Memoize Expensive Computations**
   ```tsx
   const expensiveValue = useMemo(() => {
     return heavyComputation(data);
   }, [data]);
   ```

3. **Use React.memo for Pure Components**
   ```tsx
   export default React.memo(MyComponent);
   ```

4. **Optimize Images**
   ```tsx
   import Image from 'next/image';
   <Image src="..." width={100} height={100} alt="..." />
   ```

5. **Cache API Responses**
   ```tsx
   // Already implemented in weatherCache.ts
   const cached = getCachedWeather(cityId);
   if (cached) return cached;
   ```

---

## 📚 Key Files Reference

| File | Purpose |
|------|---------|
| `app/[locale]/layout.tsx` | Root layout, i18n, theme |
| `stores/useWeatherStore.ts` | Global app state |
| `lib/helpers.ts` | Shared utilities |
| `lib/weatherCache.ts` | Weather data caching |
| `config/tokens.ts` | Design system tokens |
| `i18n/routing.ts` | i18n routing config |
| `middleware.ts` | Locale detection |
| `components/Layout/PersistentLayout.tsx` | Header + Navigation wrapper |
| `features/weather/index.ts` | Weather feature exports |
| `features/search/index.ts` | Search feature exports |

---

## 🔗 Quick Links

- **Architecture Analysis**: `ARCHITECTURE_ANALYSIS.md`
- **Migration Guide**: `MIGRATION_GUIDE.md`
- **Project Rules**: `CLAUDE.md`
- **Feature Documentation**: `ARCHITECTURE.md`
- **Next.js Docs**: https://nextjs.org/docs
- **Zustand Docs**: https://docs.pmnd.rs/zustand
- **shadcn/ui Docs**: https://ui.shadcn.com

---

**Last Updated**: October 11, 2025  
**Version**: 1.0  
**Status**: ✅ Ready to use

