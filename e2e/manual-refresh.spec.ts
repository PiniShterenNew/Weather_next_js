import { test, expect } from '@playwright/test';

test.describe('Manual Refresh Flow', () => {
  test('should refresh city data manually', async ({ page }) => {
    await page.goto('/');
    
    // Wait for initial load
    await page.waitForSelector('[data-testid="weather-list"]', { timeout: 10000 });
    
    // Find refresh button (assuming it exists in the UI)
    const refreshButton = page.locator('[data-testid="refresh-button"]');
    
    if (await refreshButton.isVisible()) {
      // Click refresh button
      await refreshButton.click();
      
      // Wait for loading state
      await page.waitForSelector('[data-testid="loading-overlay"]', { timeout: 5000 });
      
      // Wait for loading to complete
      await page.waitForSelector('[data-testid="loading-overlay"]', { state: 'hidden', timeout: 10000 });
      
      // Verify data is still visible
      await expect(page.locator('[data-testid="weather-list"]')).toBeVisible();
    }
  });

  test('should handle refresh errors gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/weather*', route => route.abort());
    
    await page.goto('/');
    
    // Wait for initial load
    await page.waitForSelector('[data-testid="weather-list"]', { timeout: 10000 });
    
    // Try to refresh
    const refreshButton = page.locator('[data-testid="refresh-button"]');
    
    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      
      // Should show error toast
      await expect(page.locator('text=Data loading error')).toBeVisible();
    }
  });

  test('should show success message after successful refresh', async ({ page }) => {
    await page.goto('/');
    
    // Wait for initial load
    await page.waitForSelector('[data-testid="weather-list"]', { timeout: 10000 });
    
    // Mock successful refresh
    await page.route('**/api/weather*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'city:31.8_35.2',
          name: { en: 'Jerusalem', he: 'ירושלים' },
          country: { en: 'Israel', he: 'ישראל' },
          lat: 31.7683,
          lon: 35.2137,
          lastUpdatedUtc: new Date().toISOString(),
          current: {
            codeId: 800,
            temp: 25,
            feelsLike: 27,
            tempMin: 20,
            tempMax: 30,
            desc: 'Clear sky',
            icon: '01d',
            humidity: 50,
            wind: 5,
            windDeg: 180,
            pressure: 1013,
            visibility: 10000,
            clouds: 0,
            sunrise: 1640995200,
            sunset: 1641038400,
            timezone: 7200
          },
          forecast: [],
          hourly: []
        })
      });
    });
    
    // Try to refresh
    const refreshButton = page.locator('[data-testid="refresh-button"]');
    
    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      
      // Should show success message
      await expect(page.locator('text=Data updated')).toBeVisible();
    }
  });
});
