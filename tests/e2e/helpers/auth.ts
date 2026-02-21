import { Page, expect } from '@playwright/test';

const TEST_EMAIL = process.env.E2E_TEST_EMAIL || 'e2e-test@offmind.ai';
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD || 'test-password-e2e';

export async function login(page: Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  // Wait for redirect to dashboard
  await page.waitForURL(/\/(today|inbox|home)/, { timeout: 10000 });
}

export async function ensureLoggedIn(page: Page) {
  await page.goto('/today');
  const url = page.url();
  if (url.includes('/login') || url.includes('/signup')) {
    await login(page);
  }
}

export async function logout(page: Page) {
  await page.goto('/settings');
  await page.click('button:has-text("Sign Out")');
  await page.waitForURL(/\/login/);
}
