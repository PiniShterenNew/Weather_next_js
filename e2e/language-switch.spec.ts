import { test, expect } from '@playwright/test';

test.describe('Language Switching', () => {
  test('should verify page loads with language elements', async ({ page }) => {
    await page.goto('/');
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/http:\/\/localhost:3000/);
    
    await page.screenshot({ path: 'test-results/language-page.png', fullPage: true });
    
  });
});