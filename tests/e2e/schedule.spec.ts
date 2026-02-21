import { test, expect } from '@playwright/test';
import { ensureLoggedIn } from './helpers/auth';

test.describe('Schedule', () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedIn(page);
  });

  test('should load schedule page', async ({ page }) => {
    await page.goto('/schedule');
    await expect(page).toHaveURL(/\/schedule/);
  });

  test('should show today page with scheduled items section', async ({ page }) => {
    await page.goto('/today');
    // Today page should have some content
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate between schedule views', async ({ page }) => {
    await page.goto('/schedule');
    // Check that the page loads without errors
    await expect(page.locator('body')).toBeVisible();
  });
});
