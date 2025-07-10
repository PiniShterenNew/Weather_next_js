// playwright.config.ts
import { PlaywrightTestConfig, devices } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './e2e',
  timeout: 60000, // הגדלת הטיימאאוט ל-60 שניות
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // ניסיון חוזר אחד במקרה של כישלון
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    baseURL: 'http://localhost:3000', // הגדרת כתובת הבסיס
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // זמן המתנה ארוך יותר לעליית השרת
  },
};

export default config;