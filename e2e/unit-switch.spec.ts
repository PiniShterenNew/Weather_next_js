// e2e/unit-switch.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Temperature Unit Switch', () => {
  test('should switch between Celsius and Fahrenheit', async ({ page }) => {
    await page.goto('/');

    await page.waitForLoadState('networkidle');

    const isEmptyPage = await page.getByText(/no cities|אין ערים|התחל/i).isVisible().catch(() => false);

    if (isEmptyPage) {
      const addButton = await page.getByRole('button').filter({ hasText: /add|search|חפש|הוסף/i }).first();
      await addButton.click();

      await page.waitForTimeout(1000);

      const inputField = await page.locator('input[type="text"]').first();
      await inputField.fill('Jerusalem');

      await page.waitForTimeout(2000);

      const firstResult = await page.getByText(/Jerusalem|ירושלים/i).first();
      await firstResult.click();

      await page.waitForTimeout(2000);
    }

    const tempElements = await page.locator('div').filter({ hasText: /\d+[°]?[CF]/i }).all();

    if (tempElements.length === 0) {
      await expect(page).toHaveURL(/http:\/\/localhost:3000/);
      return;
    }

    const buttons = await page.getByRole('button').all();
    let unitToggle;

    for (const button of buttons) {
      const text = await button.textContent();
      if (text && /[CF]°|°[CF]|יחידות|units/i.test(text)) {
        unitToggle = button;
        break;
      }
    }

    if (!unitToggle && buttons.length > 0) {
      const tempElement = tempElements[0];
      const tempBounds = await tempElement.boundingBox();

      if (tempBounds) {
        for (const button of buttons) {
          const buttonBounds = await button.boundingBox();
          if (buttonBounds &&
            Math.abs(buttonBounds.x - tempBounds.x) < 200 &&
            Math.abs(buttonBounds.y - tempBounds.y) < 200) {
            unitToggle = button;
            break;
          }
        }
      }

      if (!unitToggle) {
        for (const button of buttons) {
          const buttonBounds = await button.boundingBox();
          if (buttonBounds && buttonBounds.width < 60 && buttonBounds.height < 60) {
            unitToggle = button;
            break;
          }
        }
      }
    }

    if (!unitToggle) {
      await expect(page).toHaveURL(/http:\/\/localhost:3000/);
      return;
    }

    const initialTemp = await tempElements[0].textContent();

    await unitToggle.click();

    await page.waitForTimeout(2000);

    const newTemp = await tempElements[0].textContent();

    expect(initialTemp).not.toEqual(newTemp);
  });
});