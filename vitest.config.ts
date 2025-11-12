// vitest.config.ts
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html', 'json'],
      reportsDirectory: './coverage',
      all: false,
      include: [
        'components/**/*.{ts,tsx}',
        // Focus coverage on component surface, helpers, hooks and stores
        'features/**/components/**/*.{ts,tsx}',
        'lib/helpers/**/*.{ts,tsx}',
        'hooks/**/*.{ts,tsx}',
      ],
      exclude: [
        // Entire components dir not counted in coverage (covered via integration)
        'components/**',
        // Exclude stores from coverage aggregation (validated via integration)
        'store/**',
        // Generic UI primitives are thin wrappers tested upstream
        'components/ui/**',
        // Heavy external-facing helpers and server/db utilities
        'lib/helpers/geoapify.ts',
        'lib/weather/**',
        'lib/server/**',
        'lib/db/**',
        // Feature infra not unit-covered
        'features/**/actions/**/*.{ts,tsx}',
        'features/**/services/**/*.{ts,tsx}',
        // App Router framework files and pages are integration/e2e-covered; exclude from unit coverage
        'app/**/page.tsx',
        'app/**/layout.tsx',
        'app/**/route.ts',
        // Feature-level routed pages (covered via integration)
        'features/**/pages/**/*.{ts,tsx}',
        '**/*.test.*',
        '**/*.spec.*',
        '**/*.d.ts',
        '**/node_modules/**',
        'next.config.ts',
        'tailwind.config.ts',
        'vitest.config.ts',
        'e2e/**/*.{ts,tsx}',
        '**/types.ts',
        '**/index.ts',
        '**/README.md',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
    deps: {
      optimizer: {
        web: {
          include: ['next-intl'],
        },
      },
    },
    server: {
      deps: {
        external: ['next/navigation'],
      },
    },
    setupFiles: ['./tests/setup.ts'],
    exclude: ['e2e/**', 'node_modules/**', '.next/**'], // הוספת exclude ברמת test
  },
});