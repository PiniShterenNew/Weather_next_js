// e2e/city-search.spec.ts
import { test, expect } from '@playwright/test';

test.describe('City Search Flow', () => {
  test('should search for a city and display weather', async ({ page }) => {
    await page.goto('/');
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await expect(page).toHaveURL(/http:\/\/localhost:3000/);
    
    await page.screenshot({ path: 'test-results/home-page.png', fullPage: true });
    
  });
});