import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to simulate first-time user
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test('should show welcome screen on first visit', async ({ page }) => {
    await page.goto('/');
    
    // Should redirect to welcome page
    await expect(page).toHaveURL(/.*\/welcome/);
    
    // Check welcome screen content
    await expect(page.getByText('Welcome to the Weather App')).toBeVisible();
    await expect(page.getByText('Add cities, get forecasts, and work offline.')).toBeVisible();
    
    // Check feature items
    await expect(page.getByText('Add Cities')).toBeVisible();
    await expect(page.getByText('Get Forecasts')).toBeVisible();
    await expect(page.getByText('Works Offline')).toBeVisible();
    
    // Check CTA button
    await expect(page.getByRole('button', { name: 'Get Started' })).toBeVisible();
  });

  test('should navigate to home after clicking Get Started', async ({ page }) => {
    await page.goto('/welcome');
    
    // Click Get Started button
    await page.getByRole('button', { name: 'Get Started' }).click();
    
    // Should redirect to home page
    await expect(page).toHaveURL(/.*\/$/);
    
    // Should not show welcome screen again
    await page.goto('/');
    await expect(page).toHaveURL(/.*\/$/);
    await expect(page.getByText('Welcome to the Weather App')).not.toBeVisible();
  });

  test('should not show welcome screen after marking as seen', async ({ page }) => {
    await page.goto('/welcome');
    
    // Click Get Started
    await page.getByRole('button', { name: 'Get Started' }).click();
    
    // Navigate to home
    await page.goto('/');
    
    // Should not redirect to welcome
    await expect(page).toHaveURL(/.*\/$/);
    await expect(page.getByText('Welcome to the Weather App')).not.toBeVisible();
  });

  test('should reset welcome screen from settings', async ({ page }) => {
    // First, complete onboarding
    await page.goto('/welcome');
    await page.getByRole('button', { name: 'Get Started' }).click();
    
    // Go to settings
    await page.goto('/settings');
    
    // Find and click reset welcome button
    await page.getByText('Reset Welcome Screen').click();
    
    // Confirm reset
    await page.getByRole('button', { name: 'Reset Welcome Screen' }).click();
    
    // Navigate to home - should redirect to welcome
    await page.goto('/');
    await expect(page).toHaveURL(/.*\/welcome/);
    await expect(page.getByText('Welcome to the Weather App')).toBeVisible();
  });

  test('should work in Hebrew locale', async ({ page }) => {
    await page.goto('/he/welcome');
    
    // Check Hebrew content
    await expect(page.getByText('ברוך הבא לאפליקציית מזג האוויר')).toBeVisible();
    await expect(page.getByText('הוסף ערים, קבל תחזיות, ועבוד גם אופליין.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'התחל' })).toBeVisible();
  });
});
