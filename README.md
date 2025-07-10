# Weather Next.js App | אפליקציית מזג אוויר

A bilingual (Hebrew/English) weather application built with Next.js, providing real-time weather forecasts for selected cities worldwide with 99/100 Lighthouse performance scores.

אפליקציית מזג אוויר דו-לשונית (עברית/אנגלית) המבוססת על Next.js, מציגה תחזית מזג אוויר עדכנית עבור ערים נבחרות עם ציון 99/100 במבחני ביצועים של Lighthouse.

![Weather App Screenshot](/public/github_pic.png)

## Features | תכונות

- 🌐 **Full Bilingual Support**: Hebrew and English interfaces with complete RTL/LTR handling
- 🔍 **City Search**: Intelligent search in both languages with automatic suggestions
- 📱 **Responsive Design**: Optimized for all screen sizes from mobile to desktop
- 🌙 **Dark/Light Mode**: Comfortable viewing in any lighting condition
- 🔄 **Automatic Updates**: Periodic weather data refresh
- 📊 **Forecast Display**: Multi-day weather forecast with detailed information
- 📍 **Current Location**: Automatic user location detection (with permission)
- 🌡️ **Temperature Units**: Toggle between Celsius and Fahrenheit
- ⚡ **Optimized Performance**: 99/100 Lighthouse score with Next.js optimization
- 🧪 **Comprehensive Testing**: 93% code coverage with unit, integration and e2e tests

## Architecture | ארכיטקטורה

The application follows a modern, scalable architecture:

- **Frontend Layer**: Next.js App Router for optimized rendering and routing
- **Component Layer**: Reusable React components with proper separation of concerns
- **State Management**: Zustand for global state management
- **Data Layer**: Custom API routes with database caching for weather data
- **Internationalization**: Full i18n support with next-intl
- **Database**: Prisma ORM with SQLite for data persistence

### Bilingual City Search Architecture

The city search functionality implements a sophisticated bilingual approach:
1. The `getSuggestions` function makes parallel API calls for both Hebrew and English searches
2. Results are combined into unified city objects containing both language representations
3. The `/api/suggest` endpoint first checks the database for existing cities
4. If not found, it calls the external API and stores the bilingual results

## Technologies | טכנולוגיות

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **UI Library**: React 19
- **Styling**: TailwindCSS, ShadcnUI with Radix primitives
- **Animation**: Framer Motion
- **State Management**: Zustand
- **Internationalization**: next-intl

### Backend
- **API Routes**: Next.js API routes with proper error handling
- **Database**: Prisma with SQLite
- **External APIs**: OpenWeather API, Geoapify for location services

### Testing
- **Unit & Integration**: Vitest with React Testing Library (93.73% coverage)
- **End-to-End**: Playwright for cross-browser testing
- **Performance**: Lighthouse CI integration

## Quality Metrics | מדדי איכות

- **Test Coverage**: 93.73% statement coverage
- **Performance**: 99/100 Lighthouse score
- **Accessibility**: 100/100 Lighthouse score
- **Best Practices**: 100/100 Lighthouse score
- **SEO**: 100/100 Lighthouse score

## Installation & Running | התקנה והפעלה

### Prerequisites | דרישות מוקדמות

- Node.js v18 or higher
- npm v9 or higher

### Installation | התקנה

```bash
# Clone the repository
git clone https://github.com/yourusername/weather-next-js.git
cd weather-next-js

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add required API keys
```

### Running | הפעלה

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

### Testing | בדיקות

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run end-to-end tests
npm run e2e

# Run end-to-end tests with UI
npm run e2e:ui
```

## Project Structure | מבנה הפרוייקט

```
/app                  # Next.js App Router
  /[locale]           # i18n route structure
  /api                # API routes
/components           # Reusable components
/lib                  # Utilities and helpers
/features             # Feature-specific logic
/providers            # Context providers
/public               # Static assets
/stores               # Zustand stores
/test                 # Test utilities
/prisma               # Database schema
```

## Key Learnings | תובנות מרכזיות

- Building high-performance React applications with Next.js
- Implementing full RTL/LTR bilingual support
- Effective state management with Zustand
- Testing strategies for modern React applications
- API integration with proper error handling and caching
- Accessibility and internationalization best practices

## Future Improvements | שיפורים עתידיים

- Add more weather data providers
- Implement user accounts for saved preferences
- Add more detailed weather visualizations
- Implement PWA functionality for offline support
- Add weather alerts and notifications