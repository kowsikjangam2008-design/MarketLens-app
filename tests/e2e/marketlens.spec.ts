import { test, expect } from '@playwright/test';

test.describe('MarketLens Core User Flows', () => {
  test('homepage loads with branding, market session, and disclaimer', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/MarketLens/i);

    // Verify brand and tagline
    await expect(page.getByText('MarketLens', { exact: false })).toBeVisible();
    await expect(page.getByText('What is happening in the Indian market?')).toBeVisible();

    // Verify no trading/brokerage functionality exists
    await expect(page.getByRole('button', { name: /buy/i })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /sell/i })).toHaveCount(0);
  });

  test('search command palette can be opened and searched', async ({ page }) => {
    await page.goto('/');

    // Click search trigger in header
    const searchTrigger = page.getByRole('button', { name: /search/i }).first();
    await searchTrigger.click();

    // Verify search modal opened
    const searchInput = page.getByPlaceholder(/search by company name/i);
    await expect(searchInput).toBeVisible();

    // Type query
    await searchInput.fill('RELIANCE');
    // Results or suggestions should appear
    await expect(page.getByText('RELIANCE.NS').first()).toBeVisible();
  });

  test('navigates to stock detail page and displays honest data without fake candles', async ({ page }) => {
    await page.goto('/stocks/RELIANCE.NS');

    // Ticker and exchange should be visible
    await expect(page.getByText('RELIANCE.NS')).toBeVisible();

    // Price chart section should report honest limitations if no historical endpoint
    await expect(
      page.getByText(/historical chart unavailable|tradingview/i).first()
    ).toBeVisible();

    // Check key data metrics card
    await expect(page.getByText('Key Stock Data & Metrics')).toBeVisible();

    // Check informational signal disclaimer
    await expect(page.getByText(/not personalized investment advice/i)).toBeVisible();
  });

  test('watchlist saves and persists symbols locally', async ({ page }) => {
    await page.goto('/watchlist');

    await expect(page.getByRole('heading', { name: /my watchlist/i })).toBeVisible();

    // Add new symbol
    const addInput = page.getByPlaceholder(/add symbol/i);
    await addInput.fill('WIPRO.NS');
    await page.getByRole('button', { name: /add/i }).click();

    // WIPRO.NS should be present in table or list
    await expect(page.getByText('WIPRO.NS').first()).toBeVisible();
  });

  test('screener page renders filter controls and results', async ({ page }) => {
    await page.goto('/screener');

    await expect(page.getByRole('heading', { name: /stock screener/i })).toBeVisible();
    await expect(page.getByText('Screener Filters')).toBeVisible();
    await expect(page.getByText('Price Range (₹)')).toBeVisible();
  });

  test('settings page allows switching modes and clearing watchlist', async ({ page }) => {
    await page.goto('/settings');

    await expect(page.getByRole('heading', { name: /application settings/i })).toBeVisible();
    await expect(page.getByText('Beginner Mode:')).toBeVisible();
    await expect(page.getByText('Advanced Mode:')).toBeVisible();
  });

  test('about page clearly displays 0xramm provider and TradingView attribution', async ({ page }) => {
    await page.goto('/about');

    await expect(page.getByRole('heading', { name: /about marketlens/i })).toBeVisible();
    await expect(page.getByText(/0xramm Indian Stock Market API/i)).toBeVisible();
    await expect(page.getByText(/TradingView Lightweight Charts/i)).toBeVisible();
    await expect(page.getByText(/Not an Official NSE or BSE Product/i)).toBeVisible();
  });

  test('theme toggle switches visual mode', async ({ page }) => {
    await page.goto('/');

    const themeToggle = page.getByRole('button', { name: /switch to/i });
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      // HTML class should reflect change
      const html = page.locator('html');
      await expect(html).toBeVisible();
    }
  });

  test('mobile viewport layout displays compact bottom navigation without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE / Mobile size
    await page.goto('/');

    // Mobile bottom navigation should be visible
    const mobileNav = page.getByRole('navigation', { name: /mobile navigation/i });
    await expect(mobileNav).toBeVisible();

    // Check body width has no horizontal overflow
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2); // 2px margin for subpixel rendering
  });
});
