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
      provider: 'v8', // אפשר גם 'c8' אם תעדיף
      reporter: ['text', 'json-summary', 'html'],
      reportsDirectory: './coverage',
      include: ['components/**/*.{ts,tsx}', 'app/**/*.{ts,tsx}'],
      exclude: [
        '**/*.test.*',
        '**/*.d.ts',
        '**/node_modules/**',
        'next.config.ts',
        'tailwind.config.ts',
        'vitest.config.ts',
        'e2e/**/*.{ts,tsx}',
      ],
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