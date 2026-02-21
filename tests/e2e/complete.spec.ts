import { test, expect } from '@playwright/test';
import { ensureLoggedIn } from './helpers/auth';

test.describe('Complete', () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedIn(page);
  });

  test('should toggle item completion via checkbox', async ({ page }) => {
    await page.goto('/inbox');

    // Find a checkbox on an item card
    const checkbox = page.locator('[role="checkbox"]').first();
    if (await checkbox.isVisible()) {
      const wasChecked = await checkbox.getAttribute('data-state');
      await checkbox.click();
      // Wait for animation
      await page.waitForTimeout(600);

      // State should have changed
      const newState = await checkbox.getAttribute('data-state');
      expect(newState).not.toBe(wasChecked);
    }
  });

  test('should show settings page', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.locator('h1')).toContainText('Settings');
  });

  test('should show export button in settings', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.locator('text=Export All Data')).toBeVisible();
  });

  test('should show danger zone in settings', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.locator('text=Danger Zone')).toBeVisible();
  });
});
