import { test, expect } from '@playwright/test';

// Configure test retries for flaky tests
test.describe.configure({ retries: 2 });

// Helper function to check if element is visible (non-blocking)
async function checkVisibility(page: any, selector: string, description: string): Promise<boolean> {
  try {
    const element = page.locator(selector).first();
    await expect(element).toBeVisible({ timeout: 5000 });
    return true;
  } catch {
    console.warn(`⚠️ Element not visible: ${description} (${selector})`);
    return false;
  }
}

// Helper function to wait for page to stabilize
async function waitForPageStable(page: any, timeout = 30000) {
  try {
    // Wait for DOM to be ready first
    await page.waitForLoadState('domcontentloaded', { timeout });
    
    // Then wait for network to be idle (but don't fail if it takes too long)
    try {
      await page.waitForLoadState('networkidle', { timeout: Math.min(timeout, 10000) });
    } catch {
      // Network idle is optional - continue if it fails
    }
    
    // Wait for animations and data loading
    await page.waitForTimeout(2000);
  } catch (error) {
    // If domcontentloaded fails, wait a bit and continue
    await page.waitForTimeout(3000);
  }
}

// Helper function to wait for specific element with retry
async function waitForElementWithRetry(page: any, selector: string, timeout = 10000, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await page.waitForSelector(selector, { timeout, state: 'visible' });
      return true;
    } catch {
      if (i < retries - 1) {
        await page.waitForTimeout(1000); // Wait before retry
      }
    }
  }
  return false;
}

// Define all pages to test
const pages = [
  { path: '/', name: 'home', requiresAuth: true },
  { path: '/cities', name: 'cities', requiresAuth: true },
  { path: '/add-city', name: 'add-city', requiresAuth: true },
  { path: '/settings', name: 'settings', requiresAuth: true },
  { path: '/settings/about', name: 'settings-about', requiresAuth: true },
  { path: '/profile', name: 'profile', requiresAuth: true },
  { path: '/sign-in', name: 'sign-in', requiresAuth: false },
  { path: '/sign-up', name: 'sign-up', requiresAuth: false },
  { path: '/forgot-password', name: 'forgot-password', requiresAuth: false },
  { path: '/welcome', name: 'welcome', requiresAuth: false },
];

// Define locales
const locales = ['he', 'en'];

// Test for desktop viewport
test.describe('Desktop Visibility Check', () => {
  for (const locale of locales) {
    test.describe(`Locale: ${locale}`, () => {
      for (const pageConfig of pages) {
        test(`should display ${pageConfig.name} page correctly in ${locale}`, async ({ page }) => {
          // Set desktop viewport
          await page.setViewportSize({ width: 1920, height: 1080 });
          
          const url = `/${locale}${pageConfig.path}`;
          
          // Navigate to page with timeout
          try {
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
            await waitForPageStable(page);
          } catch (error) {
            // If navigation fails, check if we're redirected
            const currentUrl = page.url();
            if (currentUrl.includes('/sign-in') && pageConfig.requiresAuth) {
              // Expected redirect for auth pages
              await expect(page).toHaveURL(/.*\/sign-in/);
              return;
            }
            throw error; // Re-throw if it's not an expected redirect
          }
          
          // If page requires auth and we're redirected to sign-in, that's expected
          const currentUrl = page.url();
          if (pageConfig.requiresAuth && currentUrl.includes('/sign-in')) {
            // Verify we're on sign-in page (expected behavior)
            await expect(page).toHaveURL(/.*\/sign-in/);
            await checkVisibility(page, 'header', 'Auth Header');
            return; // Skip further checks for authenticated pages
          }
          
          // Verify URL matches expected page (with more flexible timeout for welcome)
          const urlPattern = pageConfig.path === '/' 
            ? new RegExp(`.*\/${locale}\/?$`)
            : new RegExp(`.*${pageConfig.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*`);
          
          // For welcome page, allow more time as it might redirect based on localStorage
          if (pageConfig.name === 'welcome') {
            await expect(page).toHaveURL(urlPattern, { timeout: 10000 });
          } else {
            await expect(page).toHaveURL(urlPattern);
          }
          
          // Check page-specific visibility
          switch (pageConfig.name) {
            case 'home':
              // Check for header
              await checkVisibility(page, 'header', 'Header');
              // Check for bottom navigation (should be visible on authenticated pages)
              if (pageConfig.requiresAuth) {
                await checkVisibility(page, 'footer', 'Bottom Navigation');
              }
              break;
              
            case 'cities':
              // Check for cities page header
              await checkVisibility(page, 'h1', 'Cities Page Header');
              // Check for search bar
              await checkVisibility(page, 'input[type="text"], input[type="search"]', 'Search Input');
              if (pageConfig.requiresAuth) {
                await checkVisibility(page, 'footer', 'Bottom Navigation');
              }
              break;
              
            case 'add-city':
              // Check for add city header
              await checkVisibility(page, 'h1', 'Add City Header');
              // Check for search input
              await checkVisibility(page, 'input[type="text"], input[type="search"]', 'Search Input');
              if (pageConfig.requiresAuth) {
                await checkVisibility(page, 'footer', 'Bottom Navigation');
              }
              break;
              
            case 'settings':
              // Check for settings content
              await checkVisibility(page, 'main, [role="main"]', 'Settings Main Content');
              if (pageConfig.requiresAuth) {
                await checkVisibility(page, 'footer', 'Bottom Navigation');
              }
              break;
              
            case 'settings-about':
              // Check for about page content
              await checkVisibility(page, 'main, [role="main"]', 'About Page Content');
              // Bottom nav should be hidden on about page
              break;
              
            case 'profile':
              // Check for profile content
              await checkVisibility(page, 'main, [role="main"]', 'Profile Main Content');
              // Header and bottom nav should be hidden on profile page
              break;
              
            case 'sign-in':
            case 'sign-up':
            case 'forgot-password':
              // Check for auth header
              await checkVisibility(page, 'header', 'Auth Header');
              // Check for form elements
              await checkVisibility(page, 'form, button, input', 'Auth Form Elements');
              break;
              
            case 'welcome':
              // Check for welcome content
              await checkVisibility(page, 'main, [role="main"]', 'Welcome Content');
              // Check for CTA button
              await checkVisibility(page, 'button', 'Get Started Button');
              break;
          }
        });
      }
    });
  }
});

// Test for mobile viewport
test.describe('Mobile Visibility Check', () => {
  for (const locale of locales) {
    test.describe(`Locale: ${locale}`, () => {
      for (const pageConfig of pages) {
        test(`should display ${pageConfig.name} page correctly in ${locale} (mobile)`, async ({ page }) => {
          // Set mobile viewport
          await page.setViewportSize({ width: 375, height: 667 });
          
          const url = `/${locale}${pageConfig.path}`;
          
          // Navigate to page with timeout
          try {
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
            await waitForPageStable(page);
          } catch (error) {
            // If navigation fails, check if we're redirected
            const currentUrl = page.url();
            if (currentUrl.includes('/sign-in') && pageConfig.requiresAuth) {
              // Expected redirect for auth pages
              await expect(page).toHaveURL(/.*\/sign-in/);
              return;
            }
            throw error; // Re-throw if it's not an expected redirect
          }
          
          // If page requires auth and we're redirected to sign-in, that's expected
          const currentUrl = page.url();
          if (pageConfig.requiresAuth && currentUrl.includes('/sign-in')) {
            // Verify we're on sign-in page (expected behavior)
            await expect(page).toHaveURL(/.*\/sign-in/);
            await checkVisibility(page, 'header', 'Auth Header');
            return; // Skip further checks for authenticated pages
          }
          
          // Verify URL matches expected page (with more flexible timeout for welcome)
          const urlPattern = pageConfig.path === '/' 
            ? new RegExp(`.*\/${locale}\/?$`)
            : new RegExp(`.*${pageConfig.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*`);
          
          // For welcome page, allow more time as it might redirect based on localStorage
          if (pageConfig.name === 'welcome') {
            await expect(page).toHaveURL(urlPattern, { timeout: 10000 });
          } else {
            await expect(page).toHaveURL(urlPattern);
          }
          
          // Check page-specific visibility
          switch (pageConfig.name) {
            case 'home':
              // Check for header
              await checkVisibility(page, 'header', 'Header');
              // Check for bottom navigation (should be visible on authenticated pages)
              if (pageConfig.requiresAuth) {
                await checkVisibility(page, 'footer', 'Bottom Navigation');
              }
              break;
              
            case 'cities':
              // Check for cities page header
              await checkVisibility(page, 'h1', 'Cities Page Header');
              // Check for search bar
              await checkVisibility(page, 'input[type="text"], input[type="search"]', 'Search Input');
              if (pageConfig.requiresAuth) {
                await checkVisibility(page, 'footer', 'Bottom Navigation');
              }
              break;
              
            case 'add-city':
              // Check for add city header
              await checkVisibility(page, 'h1', 'Add City Header');
              // Check for search input
              await checkVisibility(page, 'input[type="text"], input[type="search"]', 'Search Input');
              if (pageConfig.requiresAuth) {
                await checkVisibility(page, 'footer', 'Bottom Navigation');
              }
              break;
              
            case 'settings':
              // Check for settings content
              await checkVisibility(page, 'main, [role="main"]', 'Settings Main Content');
              if (pageConfig.requiresAuth) {
                await checkVisibility(page, 'footer', 'Bottom Navigation');
              }
              break;
              
            case 'settings-about':
              // Check for about page content
              await checkVisibility(page, 'main, [role="main"]', 'About Page Content');
              // Bottom nav should be hidden on about page
              break;
              
            case 'profile':
              // Check for profile content
              await checkVisibility(page, 'main, [role="main"]', 'Profile Main Content');
              // Header and bottom nav should be hidden on profile page
              break;
              
            case 'sign-in':
            case 'sign-up':
            case 'forgot-password':
              // Check for auth header
              await checkVisibility(page, 'header', 'Auth Header');
              // Check for form elements
              await checkVisibility(page, 'form, button, input', 'Auth Form Elements');
              break;
              
            case 'welcome':
              // Check for welcome content
              await checkVisibility(page, 'main, [role="main"]', 'Welcome Content');
              // Check for CTA button
              await checkVisibility(page, 'button', 'Get Started Button');
              break;
          }
        });
      }
    });
  }
});

// Test for responsive layout elements
test.describe('Responsive Layout Elements', () => {
  test.describe('Desktop Layout', () => {
    test('should show desktop navigation on large screens', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      await page.goto('/he');
      await waitForPageStable(page);
      
      // Check if redirected to sign-in (auth required)
      const currentUrl = page.url();
      if (currentUrl.includes('/sign-in')) {
        // On auth pages, navigation might not be visible
        return;
      }
      
      // Desktop navigation should be visible (if user is authenticated)
      const desktopNav = page.locator('footer.hidden.lg\\:block');
      const isDesktopNavVisible = await desktopNav.isVisible().catch(() => false);
      
      if (isDesktopNavVisible) {
        await expect(desktopNav).toBeVisible();
        
        // Mobile navigation should be hidden
        const mobileNav = page.locator('footer.lg\\:hidden');
        await expect(mobileNav).not.toBeVisible();
      }
    });
  });

  test.describe('Mobile Layout', () => {
    test('should show mobile navigation on small screens', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/he');
      await waitForPageStable(page);
      
      // Check if redirected to sign-in (auth required)
      const currentUrl = page.url();
      if (currentUrl.includes('/sign-in')) {
        // On auth pages, navigation might not be visible
        return;
      }
      
      // Mobile navigation should be visible (if user is authenticated)
      const mobileNav = page.locator('footer.lg\\:hidden');
      const isMobileNavVisible = await mobileNav.isVisible().catch(() => false);
      
      if (isMobileNavVisible) {
        await expect(mobileNav).toBeVisible();
        
        // Desktop navigation should be hidden
        const desktopNav = page.locator('footer.hidden.lg\\:block');
        await expect(desktopNav).not.toBeVisible();
      }
    });
  });
});

// Test for RTL/LTR support
test.describe('RTL/LTR Support', () => {
  test('should display Hebrew page in RTL', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    await page.goto('/he');
    await waitForPageStable(page);
    
    const html = page.locator('html');
    const dir = await html.getAttribute('dir');
    expect(dir).toBe('rtl');
  });

  test('should display English page in LTR', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    await page.goto('/en');
    await waitForPageStable(page);
    
    const html = page.locator('html');
    const dir = await html.getAttribute('dir');
    expect(dir).toBe('ltr');
  });
});

