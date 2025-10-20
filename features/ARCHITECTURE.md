# Features Directory Architecture

This directory contains all feature modules following a standardized structure.

## Feature Structure

Each feature MUST follow this structure:

```
features/<feature-name>/
├── api/              # API services and clients
├── components/       # Feature-specific React components
├── store/            # Feature-specific Zustand stores (if needed)
├── tests/            # Feature-specific tests
├── types.ts          # TypeScript type definitions
└── index.ts          # Public API barrel export
```

## Current Features

### 1. Weather (`/features/weather/`)
**Purpose**: Weather data fetching and display  
**Components**: WeatherDetails, WeatherTimeNow  
**API**: weatherService, fetchWeather, fetchSuggestions, fetchReverse  
**Store**: Uses global store (`/store/useWeatherStore.ts`)

### 2. Search (`/features/search/`)
**Purpose**: City search and autocomplete  
**Components**: SearchBar, SuggestionsList, SuggestionItem  
**API**: searchService  
**Store**: useSearchStore (recent searches)  
**Dependencies**: weather feature (fetchSuggestions, fetchWeather) ⚠️

### 3. Settings (`/features/settings/`)
**Purpose**: App settings and preferences  
**Components**: SettingsModal, LanguageSwitcher, ThemeSwitcher, TemperatureUnitToggle  
**Store**: Uses global store (`/store/useWeatherStore.ts`)

### 4. Cities (`/features/cities/`)
**Purpose**: City list management and display  
**Components**: CitiesList, CityGrid, CityListItem  
**API**: Uses weather API  
**Store**: Uses global store

### 5. UI (`/features/ui/`)
**Purpose**: Shared UI feedback components  
**Components**: LoadingOverlay, Toast, ToastHost  
**Store**: Uses global store

## Architecture Rules

### ✅ ALLOWED
- Import from `/lib/` (shared utilities)
- Import from `/components/ui/` (shadcn components)
- Import from `/store/` (global Zustand store)
- Import from `/types/` (global types)
- Export public API via `index.ts`

### ❌ NOT ALLOWED
- Direct cross-feature imports (feature A → feature B components)
- Circular dependencies between features
- Importing internal files from other features

### ⚠️ EXCEPTION
- **Search feature** imports `fetchSuggestions` and `fetchWeather` from weather feature
- This is a known dependency - consider moving to `/lib/` in future refactor

## Store Strategy

**Global Store**: `/store/useWeatherStore.ts`
- Used by: weather, settings, ui features
- Contains: cities, theme, locale, unit, loading state, toasts

**Feature Stores**: 
- `search/store/useSearchStore.ts` - Recent searches only

## Migration Status

- ✅ Phase 1 Complete: Duplicate consolidation
- ⏳ Phase 2 Pending: Test organization
- ⏳ Phase 3 Pending: Complete feature migration
- ⏳ Phase 4 Pending: Final cleanup

## Next Steps

1. Move remaining components to features:
   - `components/WeatherCard/*` → `features/weather/components/`
   - `components/QuickAdd/*` → `features/quick-add/`
   - `components/HomePage/*` → `features/home/`

2. Resolve cross-feature dependency:
   - Move `fetchSuggestions`, `fetchWeather` to `/lib/weatherApi.ts`
   - Update search feature to use lib imports

3. Add comprehensive test coverage in each `tests/` directory

