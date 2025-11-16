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

### 🧩 RTL & Visual Separation Principles

1. **Structural separation before margin**  
   Prefer separate containers over manual `margin` spacing.  
   Each logical area (information vs. actions) should be wrapped in its own structural container with independent layout logic.

2. **Understanding RTL in Tailwind**  
   In RTL layouts, `mr-*` visually creates spacing **on the left**, while `ml-*` creates spacing **on the right**.  
   When spacing is required “to the right of a button” in RTL, apply `mr-*` to that button.

3. **Use flexbox layout logic**  
   - `justify-between` → separates major regions.  
   - `justify-end` → aligns action buttons to one side.  
   Structural grouping provides more predictable spacing and alignment.

4. **Group related elements**  
   - Info group: icon + label + value  
   - Actions group: refresh + delete  
   Each group should live in its own container for layout clarity.

5. **Prefer structural solutions over conditional hacks**  
   Avoid conditional margins like `${condition ? 'ml-6' : ''}`.  
   Instead, design a structure that naturally handles spacing cases through layout hierarchy.

6. **Check direction before applying spacing**  
   Always verify layout direction (`dir="rtl"` or `dir="ltr"`) before deciding between `mr-*` or `ml-*`.  
   Apply margins relative to the actual reading flow, not visual assumption.

7. **Visual separation equals structural separation**  
   Whenever a visual gap is needed, implement it through clear DOM structure (nested containers or flex separation),  
   not by stacking spacing utilities on unrelated siblings.


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

### 13. Security Enforcement

All API routes and client-server interactions must:
- Use HTTPS in all environments.
- Validate inputs/outputs with Zod schemas.
- Handle authentication and authorization through secure tokens (Clerk/JWT).
- Avoid exposing secrets or internal state to the client.
- Log security-related actions in development mode for auditability.

Each PR must include a security review checklist if any API/service logic was modified.

### 14. Build & Prerendering Rules (Next.js 15 App Router)

**Critical:** These rules prevent prerendering errors and ensure successful builds.

#### 14.1. Page Component Structure

**ALWAYS use Server Component pattern for page files:**

```tsx
// ✅ CORRECT - app/[locale]/example/page.tsx
import { Metadata } from 'next';
import { Suspense } from 'react';
import ClientExamplePage from '@/features/example/components/ClientExamplePage';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Example - Weather App',
  description: 'Example page description',
};

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function ExamplePage({ params }: PageProps) {
  const { locale } = await params;
  
  return (
    <Suspense fallback={<Skeleton className="h-full w-full" />}>
      <ClientExamplePage locale={locale} />
    </Suspense>
  );
}
```

```tsx
// ❌ WRONG - Page with 'use client'
'use client';

export default function ExamplePage() {
  // This causes prerendering errors!
}
```

#### 14.2. Client Component Naming Convention

**Client components for pages MUST be named `Client<PageName>Page`:**

- Location: `features/<feature>/components/Client<PageName>Page.tsx`
- Example: `features/cities/components/ClientCitiesPage.tsx`
- Example: `features/search/components/ClientAddCityPage.tsx`
- Example: `features/auth/components/ClientProfilePage.tsx`

#### 14.3. Suspense Usage Rules

**Suspense ONLY in Server Components:**

✅ **CORRECT:**
```tsx
// Server Component (page.tsx)
export default async function Page() {
  return (
    <Suspense fallback={<Skeleton />}>
      <ClientComponent />
    </Suspense>
  );
}
```

❌ **WRONG:**
```tsx
// Client Component
'use client';
export default function Component() {
  return (
    <Suspense fallback={<Skeleton />}>  {/* Causes prerendering errors! */}
      <OtherComponent />
    </Suspense>
  );
}
```

#### 14.4. 'use client' Directive Rules

**Rules for 'use client':**

1. **NEVER** use 'use client' in `app/**/page.tsx` files
2. **ALWAYS** use 'use client' in client component files inside `features/**/components/`
3. Client components can use hooks, browser APIs, event handlers
4. Server components can import and render client components, but not vice versa

#### 14.5. Page File Checklist

Before creating or modifying any `app/**/page.tsx`:

- [ ] File does NOT have 'use client' directive
- [ ] File exports async function (or sync if no async needed)
- [ ] File exports Metadata object
- [ ] File uses Suspense to wrap client component
- [ ] Client component is named `Client<PageName>Page`
- [ ] Client component is in `features/<feature>/components/`
- [ ] Suspense has appropriate fallback (Skeleton component)

#### 14.6. Common Prerendering Errors & Solutions

**Error:** `Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: object.`

**Cause:** Suspense inside 'use client' component or page.tsx with 'use client'

**Solution:** 
1. Remove 'use client' from page.tsx
2. Create separate Client<PageName>Page component
3. Move 'use client' to client component
4. Wrap with Suspense in server component

**Error:** `Error occurred prerendering page "/en/example"`

**Cause:** Client component using Suspense or page.tsx not structured correctly

**Solution:** Follow pattern from section 14.1

#### 14.7. Import Patterns

**Server Component (page.tsx):**
```tsx
import { Metadata } from 'next';  // ✅
import { Suspense } from 'react';  // ✅
import ClientComponent from '@/features/...';  // ✅
import { Skeleton } from '@/components/ui/skeleton';  // ✅
```

**Client Component:**
```tsx
'use client';  // ✅ Must be first line

import { useState } from 'react';  // ✅
import { useTranslations } from 'next-intl';  // ✅
import { Button } from '@/components/ui/button';  // ✅
```

#### 14.8. Build Verification

**Before committing any page changes:**

1. Run `npm run build` locally
2. Verify no prerendering errors
3. Check all pages generate successfully (● SSG or ƒ Dynamic)
4. Verify Suspense boundaries are in server components only

**Pages that MUST pass build:**
- All pages in `app/[locale]/**/page.tsx`
- All dynamic routes
- All static routes

#### 14.9. Migration Pattern

**When converting existing 'use client' page to correct pattern:**

1. Create `features/<feature>/components/Client<PageName>Page.tsx`
2. Move entire component code from page.tsx to Client component
3. Add 'use client' as first line in Client component
4. Replace page.tsx content with server component pattern (section 14.1)
5. Pass any params/props from server component to client component

**Example migration:**
```tsx
// Before: app/[locale]/cities/page.tsx
'use client';
export default function CitiesPage() {
  // ... component code
}

// After: app/[locale]/cities/page.tsx
import { Metadata } from 'next';
import { Suspense } from 'react';
import ClientCitiesPage from '@/features/cities/components/ClientCitiesPage';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = { /* ... */ };

export default async function CitiesPage({ params }: PageProps) {
  const { locale } = await params;
  return (
    <Suspense fallback={<Skeleton className="h-full w-full" />}>
      <ClientCitiesPage locale={locale} />
    </Suspense>
  );
}
```

#### 14.10. Exceptions & Edge Cases

**When NOT to split:**
- Layout files (app/**/layout.tsx) can be async server components
- Loading/Error files (app/**/loading.tsx, error.tsx) follow their own patterns
- API routes (app/api/**/route.ts) are server-only

**Special cases:**
- Dashboard pages with auth checks: Use server component with auth check, then wrap client component
- Pages that need async data fetching: Fetch in server component, pass to client component as props

#### 14.11. Automated Checks

**Add to pre-commit hooks or CI:**

```bash
# Check for 'use client' in page files
grep -r "'use client'" app/**/page.tsx && echo "ERROR: 'use client' found in page.tsx" && exit 1

# Check for Suspense in client components (basic check)
grep -r "Suspense" features/**/*Client*.tsx | grep -v "^//" && echo "WARNING: Suspense may be in client component" && exit 1
```

**Summary:**
- All `app/**/page.tsx` files MUST be Server Components
- All client logic goes in `Client<PageName>Page` components
- Suspense ONLY in server components
- Always test build before committing page changes