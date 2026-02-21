import { test, expect } from '@playwright/test';
import { ensureLoggedIn } from './helpers/auth';

test.describe('Capture', () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedIn(page);
  });

  test('should show capture bar on dashboard', async ({ page }) => {
    await page.goto('/today');
    const captureBar = page.locator('[data-quick-capture]');
    await expect(captureBar).toBeVisible();
  });

  test('should focus capture bar on Cmd+N', async ({ page }) => {
    await page.goto('/today');
    await page.keyboard.press('Meta+n');
    const captureBar = page.locator('[data-quick-capture]');
    await expect(captureBar).toBeFocused();
  });

  test('should capture a text item', async ({ page }) => {
    await page.goto('/inbox');
    const captureBar = page.locator('[data-quick-capture]');
    await captureBar.fill('E2E test capture item');
    await page.keyboard.press('Enter');
    // Wait for toast
    await expect(page.locator('[data-sonner-toast]').first()).toBeVisible({ timeout: 5000 });
  });

  test('should show captured item in inbox', async ({ page }) => {
    await page.goto('/inbox');
    const captureBar = page.locator('[data-quick-capture]');
    const uniqueText = `E2E test ${Date.now()}`;
    await captureBar.fill(uniqueText);
    await page.keyboard.press('Enter');
    // Wait for item to appear
    await expect(page.locator(`text=${uniqueText}`)).toBeVisible({ timeout: 10000 });
  });

  test('should clear capture bar after submit', async ({ page }) => {
    await page.goto('/inbox');
    const captureBar = page.locator('[data-quick-capture]');
    await captureBar.fill('Temp capture item');
    await page.keyboard.press('Enter');
    // Wait and check capture bar is cleared
    await page.waitForTimeout(1000);
    await expect(captureBar).toHaveValue('');
  });
});
