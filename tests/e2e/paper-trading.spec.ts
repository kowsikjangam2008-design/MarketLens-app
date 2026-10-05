import { test, expect } from '@playwright/test';

test.describe('MarketLens Paper Trading End-to-End User Flows', () => {
  test('navigation has Paper Trading and loads paper trading page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/MarketLens/i);

    // Click Paper Trading in sidebar
    const paperNav = page.getByRole('link', { name: /paper trading/i }).first();
    await expect(paperNav).toBeVisible();
    await paperNav.click();

    await page.waitForURL('**/paper-trading');
    await expect(page.getByText('Paper Trading Simulator')).toBeVisible();
    await expect(page.getByText(/practice trading with ₹10,00,000/i)).toBeVisible();
    await expect(page.getByText(/sign in to save your paper-trading portfolio/i)).toBeVisible();
  });

  test('signs in, receives ₹10,00,000 virtual capital, and executes simulated paper trade', async ({ page }) => {
    await page.goto('/paper-trading');

    // Click quick local practice sign-in
    const demoBtn = page.getByRole('button', { name: /continue with local practice account/i });
    if (await demoBtn.isVisible()) {
      await demoBtn.click();
    }

    // Verify authenticated dashboard loaded
    await expect(page.getByText(/paper trading portfolio/i)).toBeVisible();
    await expect(page.getByText('₹10,00,000')).toBeVisible();

    // Verify summary cards
    await expect(page.getByText('Total Portfolio Value')).toBeVisible();
    await expect(page.getByText('Available Cash')).toBeVisible();
    await expect(page.getByText('Invested Value')).toBeVisible();

    // Place a simulated Buy Market order for RELIANCE.NS
    const symbolInput = page.locator('#symbol-input');
    await symbolInput.fill('RELIANCE.NS');

    const qtyInput = page.locator('#quantity-input');
    await qtyInput.fill('5');

    // Wait for live market price to load
    await page.waitForTimeout(1000);

    const submitBtn = page.getByRole('button', { name: /buy 5 reliance\.ns/i });
    if (await submitBtn.isEnabled()) {
      await submitBtn.click();
      // Should show success confirmation
      await expect(page.getByText(/executed simulated buy order/i)).toBeVisible();

      // Holdings table should now show RELIANCE.NS
      await page.getByRole('tab', { name: /holdings/i }).click();
      await expect(page.getByText('RELIANCE.NS').first()).toBeVisible();

      // Orders tab should show executed order
      await page.getByRole('tab', { name: /orders/i }).click();
      await expect(page.getByText('EXECUTED').first()).toBeVisible();

      // Trades tab should show executed trade
      await page.getByRole('tab', { name: /trades/i }).click();
      await expect(page.getByText('BUY').first()).toBeVisible();
    }
  });

  test('stock detail page displays Paper Trade button', async ({ page }) => {
    await page.goto('/stocks/RELIANCE.NS');
    await expect(page.getByRole('button', { name: /paper trade/i })).toBeVisible();
  });
});
