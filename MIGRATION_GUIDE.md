# 🔄 Migration Guide: Completing Feature-Based Architecture

**Quick Reference for refactoring the Weather App to clean, scalable architecture**

---

## 🎯 Goal

Complete the transition from component-based to feature-based architecture by:
1. Eliminating duplicate components
2. Consolidating stores
3. Reorganizing tests
4. Splitting large files

**Estimated Time**: 2-4 hours  
**Risk Level**: Low (non-breaking changes)

---

## 📋 Pre-Migration Checklist

```bash
# 1. Create a backup branch
git checkout -b backup-before-migration
git push origin backup-before-migration

# 2. Create migration branch
git checkout main
git checkout -b feature/complete-architecture-migration

# 3. Ensure all tests pass
npm run test
npm run lint

# 4. Create a checkpoint
git add .
git commit -m "Pre-migration checkpoint"
```

---

## 🚀 Phase 1: Consolidate Duplicates (HIGH PRIORITY)

### Step 1.1: Remove Duplicate Weather Store

**Issue**: `useWeatherStore` exists in two places  
**Active**: `/stores/useWeatherStore.ts`  
**Duplicate**: `/features/weather/store/useWeatherStore.ts`

```bash
# Remove duplicate (features version is incomplete)
rm -rf features/weather/store/

# Verify no imports point to deleted store
grep -r "from '@/features/weather/store" .
# Should return no results (or update if found)

# Commit
git add features/weather/
git commit -m "Remove duplicate weather store"
```

---

### Step 1.2: Consolidate Search Components

**Decision**: Keep features version, delete old components

```bash
# Create backup of tests first
mkdir -p tests/unit/search
cp components/SearchBar/*.test.tsx tests/unit/search/

# Find all imports of old SearchBar
grep -r "from '@/components/SearchBar" app/ components/ features/

# Update imports in affected files:
# - components/QuickAdd/AddLocation.tsx
# - components/Search/CitySearch.tsx
```

**File Updates**:

```tsx
// ❌ OLD Import
import { SearchBar } from '@/components/SearchBar/SearchBar';
import { SuggestionsList } from '@/components/SearchBar/SuggestionsList';

// ✅ NEW Import
import { SearchBar, SuggestionsList } from '@/features/search';
```

**Update `features/search/index.ts`**:
```tsx
export * from './components/SearchBar';
export * from './components/SuggestionsList';
export * from './components/SuggestionItem';
export * from './store/useSearchStore';
export * from './types';
```

```bash
# After updating all imports, delete old components
rm -rf components/SearchBar/

# Verify app still works
npm run dev
# Test search functionality manually

# Commit
git add .
git commit -m "Consolidate search components to features/"
```

---

### Step 1.3: Consolidate Settings Components

**Decision**: Keep features version, delete old components

```bash
# Find all imports
grep -r "from '@/components/Settings" app/ components/ features/
grep -r "from '@/components/ToggleButtons" app/ components/ features/

# Primary affected file: components/Header/Header.tsx
```

**Update `components/Header/Header.tsx`**:
```tsx
// ❌ OLD
import SettingsModal from '@/components/Settings/SettingsModal';
import { LanguageSwitcher } from '@/components/ToggleButtons/LanguageSwitcher';
import { ThemeSwitcher } from '@/components/ToggleButtons/ThemeSwitcher';

// ✅ NEW
import { 
  SettingsModal, 
  LanguageSwitcher, 
  ThemeSwitcher 
} from '@/features/settings';
```

**Update `features/settings/index.ts`**:
```tsx
export * from './components/SettingsModal';
export * from './components/LanguageSwitcher';
export * from './components/ThemeSwitcher';
export * from './components/TemperatureUnitToggle';
export * from './types';
```

```bash
# Move tests
mkdir -p tests/unit/settings
cp components/Settings/*.test.tsx tests/unit/settings/
cp components/ToggleButtons/*.test.tsx tests/unit/settings/

# Delete old components
rm -rf components/Settings/
rm -rf components/ToggleButtons/

# Commit
git add .
git commit -m "Consolidate settings components to features/"
```

---

### Step 1.4: Consolidate Weather Components

**Decision**: Keep `/components/WeatherCard/` (more mature implementation)

```bash
# Check if features/weather/components is being used
grep -r "from '@/features/weather/components" app/ components/

# If not used, delete features version
rm -rf features/weather/components/

# Update features/weather/index.ts to export from components
```

**Update `features/weather/index.ts`**:
```tsx
// Re-export from main components directory
export { default as CityInfo } from '@/components/WeatherCard/CityInfo';
export { default as WeatherDetails } from '@/components/WeatherCard/WeatherDetails';
export { default as WeatherTimeNow } from '@/components/WeatherCard/WeatherTimeNow';
export { default as CityHeader } from '@/components/WeatherCard/CityHeader';
export { default as WeatherCardContent } from '@/components/WeatherCard/WeatherCardContent';

// Weather services
export * from './fetchWeather';
export * from './fetchReverse';
export * from './fetchSuggestions';
export * from './types';
```

```bash
# Commit
git add features/weather/
git commit -m "Consolidate weather component exports"
```

---

### Step 1.5: Consolidate UI Components

**Issue**: `LoadingOverlay` exists in two places

```bash
# Check which is being used
grep -r "from '@/components/LoadingOverlay" .
grep -r "from '@/features/ui/components/LoadingOverlay" .

# Active: /components/LoadingOverlay.tsx
# Delete: features/ui/components/LoadingOverlay.tsx
```

```bash
rm -f features/ui/components/LoadingOverlay.tsx
rm -f features/ui/components/Toast.tsx  # Check if duplicate

# Update features/ui/index.ts
```

**Update `features/ui/index.ts`**:
```tsx
// Re-export from main components
export { default as LoadingOverlay } from '@/components/LoadingOverlay';
export { default as ToastHost } from '@/components/Toast/ToastHost';
```

```bash
# Commit
git add .
git commit -m "Remove duplicate UI components"
```

---

## 🧪 Phase 2: Reorganize Tests (MEDIUM PRIORITY)

### Step 2.1: Create Test Structure

```bash
# Create mirrored directory structure
mkdir -p tests/unit/features/{weather,search,cities,settings,quick-add}
mkdir -p tests/unit/components/{layout,feedback,skeleton}
mkdir -p tests/unit/lib
mkdir -p tests/unit/stores
mkdir -p tests/unit/api
mkdir -p tests/integration
```

---

### Step 2.2: Move Component Tests

```bash
# Weather feature tests
mv components/WeatherCard/*.test.tsx tests/unit/features/weather/
mv components/ForecastList/*.test.tsx tests/unit/features/weather/

# Cities feature tests  
mv components/CitiesList/*.test.tsx tests/unit/features/cities/

# Search feature tests (already moved in Phase 1)
# tests/unit/search/ already has tests

# Settings feature tests (already moved in Phase 1)
# tests/unit/settings/ already has tests

# Quick Add feature tests
mkdir -p tests/unit/features/quick-add
mv components/QuickAdd/*.test.tsx tests/unit/features/quick-add/

# Layout component tests
mkdir -p tests/unit/components/layout
mv components/Header/*.test.tsx tests/unit/components/layout/ 2>/dev/null || true
mv components/Navigation/*.test.tsx tests/unit/components/layout/ 2>/dev/null || true
mv components/Layout/*.test.tsx tests/unit/components/layout/ 2>/dev/null || true

# Feedback component tests
mkdir -p tests/unit/components/feedback
mv components/Toast/*.test.tsx tests/unit/components/feedback/
mv components/LoadingOverlay.test.tsx tests/unit/components/feedback/
mv components/OfflineFallback/*.test.tsx tests/unit/components/feedback/

# Skeleton tests
mkdir -p tests/unit/components/skeleton
mv components/skeleton/*.test.tsx tests/unit/components/skeleton/ 2>/dev/null || true

# Page tests
mkdir -p tests/unit/pages
mv components/HomePage/*.test.tsx tests/unit/pages/
mv components/EmptyPage/*.test.tsx tests/unit/pages/
mv app/\[locale\]/__test__/*.test.tsx tests/unit/pages/
```

---

### Step 2.3: Move API Tests

```bash
# Move API route tests
mv app/api/weatherRoute.test.ts tests/unit/api/
mv app/api/suggestRoute.test.ts tests/unit/api/
mv app/api/reverseRoute.test.ts tests/unit/api/
```

---

### Step 2.4: Move Lib Tests (Already Done ✅)

```bash
# Already in correct location: lib/__test__/
# Optionally move to tests/unit/lib/
# mv lib/__test__/* tests/unit/lib/
# rm -rf lib/__test__/
```

---

### Step 2.5: Move Store Tests

```bash
# Move store tests
mv stores/useWeatherStore.test.ts tests/unit/stores/
# Note: useRecentSearchesStore.ts has no test - should create one
```

---

### Step 2.6: Update Test Imports

All moved test files need updated imports:

```tsx
// ❌ OLD (test next to component)
import { WeatherDetails } from './WeatherDetails';
import { render, screen } from '@testing-library/react';

// ✅ NEW (test in tests/ directory)
import { WeatherDetails } from '@/components/WeatherCard/WeatherDetails';
// OR
import { WeatherDetails } from '@/features/weather';
import { render, screen } from '@testing-library/react';
```

**Bulk update script** (use carefully):
```bash
# Find all test files that need import fixes
find tests/unit -name "*.test.tsx" -o -name "*.test.ts"

# For each file, update relative imports to absolute imports
# This requires manual review - use your IDE's refactoring tools
```

---

### Step 2.7: Update Vitest Config

**Update `vitest.config.ts`**:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: [
      'tests/unit/**/*.test.{ts,tsx}',
      'tests/integration/**/*.test.{ts,tsx}'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**'
    ],
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      include: [
        'app/**/*.{ts,tsx}',
        'components/**/*.{ts,tsx}',
        'features/**/*.{ts,tsx}',
        'lib/**/*.{ts,tsx}',
        'stores/**/*.{ts,tsx}',
        'hooks/**/*.{ts,tsx}'
      ],
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/*.config.{ts,js}',
        '**/types/**',
        '**/node_modules/**'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

---

### Step 2.8: Update package.json Scripts

**Update `package.json`**:
```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run tests/unit",
    "test:unit:watch": "vitest tests/unit",
    "test:integration": "vitest run tests/integration",
    "test:e2e": "playwright test",
    "test:coverage": "vitest run --coverage",
    "test:ci": "vitest run --coverage && playwright test"
  }
}
```

---

### Step 2.9: Verify Tests

```bash
# Run all tests
npm run test:unit

# If any fail, fix import paths
# Common issues:
# 1. Relative imports → should be absolute (@/)
# 2. Missing exports in index.ts barrel files
# 3. Circular dependencies

# Fix and commit
git add tests/
git add vitest.config.ts
git add package.json
git commit -m "Reorganize all tests to tests/ directory"
```

---

## ✂️ Phase 3: Split Large Files (MEDIUM PRIORITY)

### Step 3.1: Split HomePage Component

**Current**: `components/HomePage/HomePage.tsx` (167 lines)

**New Structure**:
```
components/HomePage/
├── HomePage.tsx              # Main entry (<30 lines)
├── HomePageMobile.tsx        # Mobile layout (<100 lines)
├── HomePageDesktop.tsx       # Desktop layout (<100 lines)
└── useHomePageBackground.ts  # Background logic hook (<30 lines)
```

**Create `components/HomePage/useHomePageBackground.ts`**:
```tsx
import { getWeatherBackground, isNightTime } from '@/lib/helpers';
import { CityWeather } from '@/types/weather';

export function useHomePageBackground(currentCity?: CityWeather) {
  if (!currentCity) return 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800';
  
  const weatherCode = currentCity.currentEn?.current?.codeId || 800;
  const sunrise = currentCity.currentEn?.current?.sunrise || 0;
  const sunset = currentCity.currentEn?.current?.sunset || 0;
  const currentTime = Math.floor(Date.now() / 1000);
  
  const isNight = isNightTime(currentTime, sunrise, sunset);
  return getWeatherBackground(weatherCode, isNight);
}
```

**Create `components/HomePage/HomePageMobile.tsx`**:
```tsx
'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useWeatherStore } from '@/store/useWeatherStore';
import { useHomePageBackground } from './useHomePageBackground';
import CityInfoSkeleton from '../skeleton/CityInfoSkeleton';
import EmptyPageSkeleton from '../skeleton/EmptyPageSkeleton';

const EmptyPage = dynamic(() => import('@/components/EmptyPage/EmptyPage'), {
  loading: () => <EmptyPageSkeleton />,
  ssr: false,
});

const CityInfo = dynamic(() => import('@/components/WeatherCard/CityInfo'), {
  loading: () => <CityInfoSkeleton />,
  ssr: false,
});

export default function HomePageMobile() {
  const cities = useWeatherStore((s) => s.cities);
  const currentIndex = useWeatherStore((s) => s.currentIndex);
  const currentCity = cities[currentIndex];
  const backgroundClass = useHomePageBackground(currentCity);

  return (
    <div className={`bg-cover bg-center bg-no-repeat transition-all duration-1000 pb-24 ${backgroundClass}`}>
      <div className="container mx-auto p-4 max-w-sm">
        <div className="px-2">
          {cities.length > 0 ? (
            <Suspense fallback={<CityInfoSkeleton />}>
              <CityInfo />
            </Suspense>
          ) : (
            <EmptyPage />
          )}
        </div>
      </div>
    </div>
  );
}
```

**Create `components/HomePage/HomePageDesktop.tsx`**:
```tsx
'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useWeatherStore } from '@/store/useWeatherStore';
import { useHomePageBackground } from './useHomePageBackground';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { QuickCityAddModal } from '@/components/QuickAdd/QuickCityAddModal';
import CityInfoSkeleton from '../skeleton/CityInfoSkeleton';
import EmptyPageSkeleton from '../skeleton/EmptyPageSkeleton';
import WeatherListSkeleton from '../skeleton/WeatherListSkeleton';
import { Skeleton } from '@/components/ui/skeleton';

const EmptyPage = dynamic(() => import('@/components/EmptyPage/EmptyPage'), {
  loading: () => <EmptyPageSkeleton />,
  ssr: false,
});

const AddLocation = dynamic(() => import('@/components/QuickAdd/AddLocation'), {
  loading: () => <Skeleton className="h-10 w-full" />,
});

const WeatherList = dynamic(() => import('@/components/CitiesList/Weatherlist'), {
  loading: () => <WeatherListSkeleton />,
  ssr: false,
});

const CityInfo = dynamic(() => import('@/components/WeatherCard/CityInfo'), {
  loading: () => <CityInfoSkeleton />,
  ssr: false,
});

export default function HomePageDesktop() {
  const cities = useWeatherStore((s) => s.cities);
  const currentIndex = useWeatherStore((s) => s.currentIndex);
  const currentCity = cities[currentIndex];
  const backgroundClass = useHomePageBackground(currentCity);

  return (
    <div className={`bg-cover bg-center bg-no-repeat transition-all duration-1000 ${backgroundClass}`}>
      <div className="flex h-full">
        {/* Sidebar */}
        <aside className="w-80 border-r border-border bg-card overflow-y-auto scrollbar-thin">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {cities.length > 0 ? 'ערים' : 'הוסף עיר'}
              </h2>
              {cities.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => useWeatherStore.getState().setOpen(true)}
                    aria-label="הוסף עיר"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <QuickCityAddModal />
                </div>
              )}
            </div>
            {cities.length > 0 ? (
              <WeatherList />
            ) : (
              <div className="space-y-4">
                <AddLocation type="default" size="lg" dataTestid="add-location-desktop" />
                <div className="text-center text-sm text-muted-foreground">
                  או בחר מעיר פופולרית
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {cities.length > 0 ? (
            <Suspense fallback={<CityInfoSkeleton />}>
              <CityInfo />
            </Suspense>
          ) : (
            <EmptyPage />
          )}
        </div>
      </div>
    </div>
  );
}
```

**Update `components/HomePage/HomePage.tsx`**:
```tsx
'use client';

import { useEffect, useState } from 'react';
import { useWeatherStore } from '@/store/useWeatherStore';
import HomePageMobile from './HomePageMobile';
import HomePageDesktop from './HomePageDesktop';
import LoadingOverlay from '@/components/LoadingOverlay';

export default function HomePage() {
  const isLoading = useWeatherStore((s) => s.isLoading);
  const showToast = useWeatherStore((s) => s.showToast);
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasShownSlowNetworkWarning, setHasShownSlowNetworkWarning] = useState(false);

  // Initialization and slow network warning logic
  useEffect(() => {
    const initTimer = setTimeout(() => {
      setIsInitializing(false);
    }, 100);

    const slowNetworkTimer = setTimeout(() => {
      if ((isInitializing || isLoading) && !hasShownSlowNetworkWarning) {
        setHasShownSlowNetworkWarning(true);
        showToast({
          message: 'toasts.slowNetwork',
          type: 'warning',
          duration: 8000
        });
      }
    }, 5000);

    return () => {
      clearTimeout(initTimer);
      clearTimeout(slowNetworkTimer);
    };
  }, [hasShownSlowNetworkWarning, isInitializing, isLoading, showToast]);

  useEffect(() => {
    if (!isInitializing && !isLoading) {
      setHasShownSlowNetworkWarning(false);
    }
  }, [isInitializing, isLoading]);

  return (
    <>
      {/* Mobile Layout */}
      <div className="xl:hidden">
        <HomePageMobile />
      </div>

      {/* Desktop Layout */}
      <div className="hidden xl:block">
        <HomePageDesktop />
      </div>

      <LoadingOverlay isLoading={isInitializing || isLoading} />
    </>
  );
}
```

```bash
# Commit
git add components/HomePage/
git commit -m "Split HomePage into mobile/desktop components (<200 lines each)"
```

---

### Step 3.2: Split QuickCityAddModal (Optional)

**Current**: `components/QuickAdd/QuickCityAddModal.tsx` (~120 lines)

If approaching 200 lines, extract hooks:

**Create `components/QuickAdd/useQuickAddModal.ts`**:
```tsx
import { useState, useCallback } from 'react';
import { useWeatherStore } from '@/store/useWeatherStore';

export type QuickAddTab = 'search' | 'popular';

export function useQuickAddModal() {
  const [activeTab, setActiveTab] = useState<QuickAddTab>('search');
  const open = useWeatherStore((s) => s.open);
  const setOpen = useWeatherStore((s) => s.setOpen);
  const addCity = useWeatherStore((s) => s.addCity);

  const handleTabChange = useCallback((tab: QuickAddTab) => {
    setActiveTab(tab);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    // Reset to search tab after short delay
    setTimeout(() => setActiveTab('search'), 200);
  }, [setOpen]);

  const handleCityAdd = useCallback((city: CityWeather) => {
    addCity(city);
    handleClose();
  }, [addCity, handleClose]);

  return {
    open,
    activeTab,
    setActiveTab: handleTabChange,
    onClose: handleClose,
    onCityAdd: handleCityAdd,
  };
}
```

Then simplify `QuickCityAddModal.tsx` to use the hook.

---

## 🧹 Phase 4: Cleanup (LOW PRIORITY)

### Step 4.1: Delete Empty Directories

```bash
# After moving all files, remove empty directories
find components/ -type d -empty -delete
find features/ -type d -empty -delete

# Specifically check:
# - components/SearchBar (should be deleted)
# - components/ToggleButtons (should be deleted)
# - components/Settings (should be deleted)
# - features/weather/store (should be deleted if using /stores/)
```

---

### Step 4.2: Verify All Imports

```bash
# Search for any broken imports
npm run build

# Check for unused dependencies
npx depcheck

# Check for circular dependencies
npx madge --circular --extensions ts,tsx app/ components/ features/ lib/
```

---

### Step 4.3: Update Documentation

```bash
# Update ARCHITECTURE.md with final structure
# Update README.md if needed
# Ensure ARCHITECTURE_ANALYSIS.md reflects new state
```

---

### Step 4.4: Final Testing

```bash
# Run full test suite
npm run test:unit
npm run test:integration
npm run test:e2e

# Check test coverage
npm run test:coverage
# Should maintain 80%+ coverage

# Run linter
npm run lint

# Build for production
npm run build

# Run production build locally
npm run start
# Manually test all features
```

---

## ✅ Verification Checklist

After completing all phases:

- [ ] No duplicate components exist
- [ ] All tests pass (`npm run test`)
- [ ] All tests in `/tests/` directory
- [ ] No files exceed 200 lines
- [ ] Linter passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] All imports use barrel exports (`@/features/...`)
- [ ] No circular dependencies
- [ ] Test coverage ≥ 80%
- [ ] Manual testing passed:
  - [ ] Add city
  - [ ] Search city
  - [ ] Switch language
  - [ ] Switch theme
  - [ ] Switch temperature unit
  - [ ] Remove city
  - [ ] Refresh weather
  - [ ] Mobile responsive
  - [ ] Desktop layout

---

## 🔄 Rollback Plan

If issues arise:

```bash
# Roll back to pre-migration checkpoint
git reset --hard <commit-hash-before-migration>

# OR roll back specific phases
git revert <commit-hash-of-phase-X>

# OR restore from backup branch
git checkout backup-before-migration
git checkout -b main-restored
```

---

## 📊 Success Metrics

**Before Migration**:
- Duplicate components: 12
- Test locations: 4 directories
- Large files (>200 lines): 2
- Incomplete features: 3

**After Migration**:
- Duplicate components: 0 ✅
- Test locations: 1 directory ✅
- Large files (>200 lines): 0 ✅
- Incomplete features: 0 ✅

---

## 🎉 Post-Migration

```bash
# Merge to main
git checkout main
git merge feature/complete-architecture-migration

# Push to remote
git push origin main

# Tag the release
git tag -a v2.0.0-architecture-complete -m "Complete feature-based architecture"
git push origin v2.0.0-architecture-complete

# Clean up branches
git branch -d backup-before-migration
git push origin --delete backup-before-migration
```

---

## 📞 Need Help?

If you encounter issues:

1. Check the error message carefully
2. Verify import paths are absolute (`@/...`)
3. Ensure barrel exports are updated
4. Check for circular dependencies
5. Review `ARCHITECTURE_ANALYSIS.md` for guidance

**Common Issues**:

| Issue | Solution |
|-------|----------|
| "Module not found" | Update import to use barrel export |
| "Circular dependency" | Extract shared types to `/types/` |
| "Test failed" | Update test imports to absolute paths |
| "Build failed" | Check `next.config.ts` and `tsconfig.json` paths |

---

**Document Version**: 1.0  
**Last Updated**: October 11, 2025  
**Status**: Ready for execution ✅

