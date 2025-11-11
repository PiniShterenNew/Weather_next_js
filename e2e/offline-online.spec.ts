import { test, expect } from '@playwright/test';

test.describe('Offline/Online Flow', () => {
  test('should work offline with cached data', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for initial load
    await page.waitForSelector('[data-testid="weather-list"]', { timeout: 10000 });
    
    // Go offline
    await page.context().setOffline(true);
    
    // Verify app still works with cached data
    await expect(page.locator('[data-testid="weather-list"]')).toBeVisible();
    
    // Try to refresh - should show offline message
    await page.reload();
    await expect(page.locator('text=offline')).toBeVisible();
  });

  test('should recover when coming back online', async ({ page }) => {
    // Start offline
    await page.context().setOffline(true);
    await page.goto('/');
    
    // Go back online
    await page.context().setOffline(false);
    
    // Wait for app to recover
    await page.waitForSelector('[data-testid="weather-list"]', { timeout: 10000 });
    
    // Verify app is working normally
    await expect(page.locator('[data-testid="weather-list"]')).toBeVisible();
  });

  test('should show background update banner when data changes', async ({ page }) => {
    await page.goto('/');
    
    // Wait for initial load
    await page.waitForSelector('[data-testid="weather-list"]', { timeout: 10000 });
    
    // Simulate background update by triggering a refresh
    await page.evaluate(() => {
      // This would normally be triggered by the background refresh hook
      window.dispatchEvent(new CustomEvent('backgroundUpdate', {
        detail: {
          cityId: 'city:31.8_35.2',
          cityName: 'Jerusalem',
          newData: { temp: 25 }
        }
      }));
    });
    
    // Check if background update banner appears
    await expect(page.locator('text=New data available')).toBeVisible();
  });
});
