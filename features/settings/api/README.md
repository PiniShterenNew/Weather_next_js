# Settings API

Currently, settings feature uses the global Zustand store (`/store/useWeatherStore.ts`) for state management.

No separate API layer is needed as settings are persisted via Zustand middleware.

## Future Considerations
If backend sync is required, add:
- `settingsApi.ts` - API client for syncing settings
- `settingsService.ts` - Business logic layer

