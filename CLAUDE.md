🧭 Project Overview

This project is a Next.js 15 (App Router) single-app architecture built with:

TypeScript

Zustand for state management

TailwindCSS for styling

shadcn/ui for component primitives

next-intl for localization and RTL support

PWA configuration for offline mode and installability

The goal:
A feature-based, scalable, maintainable, and testable architecture that follows modern frontend engineering standards.

🏗️ 1. Architecture Principles
Feature-Based Structure

Every business feature lives in its own folder under features/, including:

Local store

Components

Hooks

Services

Tests

Global/shared code lives outside features:

components/ui → generic reusable UI parts

lib/ → helpers, formatters, API clients

store/ → global Zustand state (minimal)

hooks/ → shared custom hooks

config/ → tokens, constants, environment setup

providers/ → contexts and Next.js providers

tests/ → e2e and global utilities

📁 2. Directory Structure
/app
 ├─ layout.tsx               # Global layout (TopBar + BottomNav)
 ├─ page.tsx                 # Main dashboard
 ├─ (cities)/page.tsx        # Cities list view
 ├─ (add)/page.tsx           # Add new city view
 └─ api/                     # API routes (validated with Zod)

/features
 ├─ weather/
 │   ├─ components/
 │   ├─ hooks/
 │   ├─ store/
 │   ├─ services/
 │   └─ tests/
 ├─ search/
 └─ settings/

/components
 ├─ ui/                      # Generic components (Button, Input, Modal, etc.)
 ├─ layout/                  # TopBar, BottomNav
 └─ common/                  # EmptyState, Loader, Skeletons

/lib
 ├─ fetchWeather.ts
 ├─ formatters.ts
 ├─ helpers.ts
 ├─ weatherIconMap.ts
 └─ constants.ts

/store
 └─ useGlobalStore.ts        # Language, theme, user location

/hooks
 ├─ useDebounce.ts
 ├─ useCityTime.ts
 ├─ useUserLocale.ts
 └─ useNetworkStatus.ts

/config
 ├─ tokens.ts
 └─ pwa.ts

/providers
 ├─ IntlProviderWrapper.tsx
 ├─ ThemeProvider.tsx
 └─ ZustandProvider.tsx

/tests
 ├─ unit/
 └─ e2e/

/styles
 ├─ globals.css
 └─ variables.css

🧱 3. Naming Conventions
Entity	Convention	Example
Components	PascalCase	WeatherCard.tsx
Hooks, Utils, Stores	camelCase	useWeatherStore.ts, fetchWeather.ts
Types & Interfaces	PascalCase	WeatherResponse, CityInfo
Test Files	<ComponentName>.test.tsx	WeatherCard.test.tsx
⚙️ 4. State Management (Zustand)

Each feature has its own store under features/<feature>/store.

Shared global state (language, theme, current unit, current location) lives in /store/useGlobalStore.ts.

Use selectors to minimize re-renders.

Actions must be pure and named with verbs (fetchWeather, addCity, refreshCity, etc.).

Persist data via zustand/middleware only for user preferences or cached results.

No component should directly fetch API data — always through a store or service.

🌐 5. Data Layer & Services

API calls live inside features/<feature>/services/.

All services:

Must use Zod for input/output validation.

Return typed results (Promise<WeatherResponse>).

Use fetch wrapped in helper utilities (lib/fetchWeather.ts).

All constants, endpoints, and environment variables are centralized in /lib/constants.ts.

🎨 6. UI / UX Standards

Tailwind classes are kept minimal and composable.

Use config/tokens.ts for spacing, color, and radius constants.

All UI must be accessible (WCAG 2.2 AA).

Each interactive component includes aria-label and keyboard focus state.

Support RTL/LTR and i18n via next-intl.

Default theme: dark.

Support theme toggle via useGlobalStore.

Each component with loading state includes an inline Skeleton component.

🧪 7. Testing Strategy
Type	Location	Framework	Coverage Target
Unit	/tests/unit or near file	Vitest	≥ 80%
Integration	/tests/integration	Testing Library	≥ 80%
E2E	/tests/e2e	Playwright	Core flows only

Guidelines:

One test file per component.

Mocks must live beside the test file (__mocks__).

Critical flows (search → add city → refresh weather) must have E2E coverage.

🚀 8. Deployment & PWA

Must pass npm run lint && npm run test before push.

CI/CD pipeline runs via GitHub Actions.

Build command: next build && next export (with PWA manifest).

PWA verified with lighthouse (score ≥ 90).

Include robots.txt, sitemap.xml, and SEO meta defaults.

🧩 9. Code Quality & Limits

No file > 300 lines → split by responsibility.

Each component must have a clear interface for props (interface Props { ... }).

No inline logic inside JSX; move to helpers/hooks.

Imports must be absolute (via tsconfig paths).

Avoid circular dependencies between features.

🧠 10. Commits, Branches, and PR Rules
Rule	Example
Branch name	feature/add-city-search, fix/weather-cache
Commit prefix	feat:, fix:, refactor:, test:, style:
Commit scope	lowercase feature name
PR title	concise, imperative form
PR checklist	✅ passes lint, ✅ passes tests, ✅ consistent with CLAUDE.md
🧭 11. Architectural Integrity Checks

Before every push or refactor:

Each component belongs to exactly one feature or ui/ folder.

All Zustand stores are in /features/<feature>/store or /store/.

No feature imports UI from another feature (only via components/ui).

Every new file includes types and testing scaffold.

Layout (TopBar, BottomNav) lives only in /components/layout.

API routes are validated with Zod.

✅ 12. Summary

This project must reflect:

Clear separation of concerns

Predictable data flow

Modular, reusable design

High code readability

Production readiness

Any automated agent (e.g., Cursor or Claude) should validate and enforce all of the above before merge or deployment.