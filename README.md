## Weather Next.js (Recruiter-Friendly Overview)

Production‑ready, bilingual (HE/EN) weather PWA. Built with Next.js 15 (App Router), TypeScript, Tailwind, shadcn/ui, and Zustand. Focused on clean feature‑based architecture, i18n/RTL, accessibility, offline support, and strong test coverage.  
אפליקציית מזג אוויר דו‑לשונית (עברית/אנגלית) עם תמיכה מלאה ב‑RTL, נגישות ו‑PWA – מותאמת לתיק עבודות.

### Highlights
- **Architecture**: Feature‑based, scalable, testable. No business logic in `components/`.
- **Next.js 15**: SSR/ISR, per‑locale routes (`/he`, `/en`), middleware for i18n.
- **State**: **Zustand** with selectors; minimal global store, per‑feature stores.
- **i18n + RTL**: `next-intl`, automatic direction handling, Hebrew/English UIs.
- **PWA**: Offline mode, installable, Workbox service workers.
- **Testing**: 450+ passing tests (Vitest unit/integration, Playwright E2E).
- **Accessibility**: WCAG 2.2 AA baseline, keyboard and aria support.

### Key Features
- City search (HE/EN), add/manage cities, forecast display, unit & theme toggles.
- Language switch (HE/EN) with routing and persisted preferences.
- Resilient data layer with Zod‑validated API routes and helpers.

### Quick Start
```bash
npm install
cp .env.example .env.local   # Fill keys (e.g., Geoapify/Clerk if used)
npx prisma generate && npx prisma db push
npm run dev                  # http://localhost:3000
```

Common scripts:
- `npm run lint` – ESLint
- `npm run test` – Vitest (watch)
- `npm run test:coverage` – Vitest + coverage
- `npm run e2e` – Playwright
- `npm run build && npm start` – Production

### Project Structure (snapshot)
```
app/                  Next.js per-locale routes and API
features/             Feature modules: components, store, hooks, services, tests
components/           Shared UI primitives (shadcn/ui) and layout
lib/, hooks/, store/  Helpers, reusable hooks, global preferences
tests/, e2e/          Unit/integration (Vitest) and E2E (Playwright)
```

### Engineering Notes
- Zod validation for inputs/outputs in API routes.
- HTTPS, secure token handling (e.g., Clerk/JWT), no client‑side secrets.
- Files kept under 300 LOC; large components split into sub‑components.
- RTL spacing and layout handled with structural separation over ad‑hoc margins.

---

## Troubleshooting • פתרון תקלות

| Symptom | Possible Cause | Fix |
| --- | --- | --- |
| `[ERROR] Bootstrap request errored "Authorization token is required..."` | Clerk session missing, AdBlock blocking requests, network change | Ensure you're signed in, disable blocking extensions, confirm `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` and retry (auto backoff runs 3 times before redirect). |
| City search returns empty | `GEOAPIFY_KEY` missing/invalid | Add key, restart dev server. |
| Swipe feels stuck / vertical scroll disabled | Check `SwipeableWeatherCard` pointer capture | Fixed in current build – ensure you pulled latest or clear browser cache. |
| Duplicate/weather icons overlapped | Clear browser cache + ensure CSS compiled. If persists, verify `WeatherIcon` usage (only single icon per slot). |
| Prisma errors on start | `DATABASE_URL` not set | Use SQLite default: `DATABASE_URL="file:./dev.db"` or your DB connection string. |

---

## Contributing • תרומה

1. Fork + branch (`feature/your-change`).  
2. Run `npm run lint && npm run test`.  
3. Submit PR with summary + screenshots (RTL + LTR).  

תהליכי הפיתוח (RTL, Zustand, Clerk, בדיקות) מתועדים תחת `/features/*/ARCHITECTURE.md`.

---

If you're reviewing for hiring: this codebase showcases production‑minded structure, internationalization depth, accessibility care, and reliable test coverage in a modern React/Next stack.

Enjoy the storm. 🌩️ | תיהנו מהסערה. 🌧️
