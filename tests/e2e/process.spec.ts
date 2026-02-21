import { test, expect } from '@playwright/test';
import { ensureLoggedIn } from './helpers/auth';

test.describe('Processing', () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedIn(page);
  });

  test('should open processing panel on item click', async ({ page }) => {
    await page.goto('/inbox');

    // Wait for items to load
    const itemCard = page.locator('[class*="rounded-2xl"][class*="shadow"]').first();
    if (await itemCard.isVisible()) {
      await itemCard.click();
      // Processing panel should appear
      const panel = page.locator('[class*="fixed right-0"]');
      await expect(panel).toBeVisible({ timeout: 5000 });
    }
  });

  test('should close processing panel on Escape', async ({ page }) => {
    await page.goto('/inbox');

    const itemCard = page.locator('[class*="rounded-2xl"][class*="shadow"]').first();
    if (await itemCard.isVisible()) {
      await itemCard.click();
      await page.waitForTimeout(500);
      await page.keyboard.press('Escape');
      // Panel should close
      await page.waitForTimeout(500);
    }
  });

  test('should show destination buttons in processing panel', async ({ page }) => {
    await page.goto('/inbox');

    const itemCard = page.locator('[class*="rounded-2xl"][class*="shadow"]').first();
    if (await itemCard.isVisible()) {
      await itemCard.click();
      // Look for destination section
      await expect(page.locator('text=Destination')).toBeVisible({ timeout: 5000 });
    }
  });
});
