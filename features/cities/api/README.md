# Cities API

Cities data is primarily sourced from the weather API endpoints.

Current approach:
- City suggestions: `/api/suggest` (handled by weather API)
- Reverse geocoding: `/api/reverse` (handled by weather API)
- Weather data: `/api/weather` (includes city info)

## Future Considerations
If dedicated city management API is needed:
- `citiesApi.ts` - CRUD operations for cities
- `cityService.ts` - Business logic for city operations

