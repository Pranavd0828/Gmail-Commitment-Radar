import { test, expect } from '@playwright/test';

test('Gmail Radar UX Smoke Test', async ({ page }) => {
  // Load inbox
  await page.goto('http://localhost:5173/');
  
  // Wait for the inbox list to load
  await expect(page.locator('text=Inbox').first()).toBeVisible();
  
  // Capture screenshot of desktop inbox
  await page.screenshot({ path: 'screenshots/1-inbox-desktop.png', fullPage: true });

  // Click a commitment badge (e.g. "Review" or "You owe")
  const badge = page.locator('button:has-text("You owe")').first();
  if (await badge.isVisible()) {
    await badge.click();
  } else {
    // Fallback if badge isn't immediately visible
    await page.locator('.flex-grow.flex.items-center.min-w-0').first().click();
  }
  
  // Verify thread and Radar panel open
  await expect(page.locator('text=Commitment Radar').first()).toBeVisible();
  
  // Capture screenshot of thread with radar panel
  await page.screenshot({ path: 'screenshots/2-thread-with-panel.png', fullPage: true });

  // Open explanation drawer
  await page.locator('button:has-text("Why am I seeing this?")').first().click();
  await expect(page.locator('text=Confidence:')).toBeVisible();
  
  // Capture screenshot of explanation drawer
  await page.screenshot({ path: 'screenshots/3-explanation-drawer.png' });

  // Navigate dashboard
  await page.locator('nav').locator('text=Commitment Radar').click();
  await expect(page.locator('text=All Open Commitments')).toBeVisible();
  
  // Capture screenshot of dashboard
  await page.screenshot({ path: 'screenshots/4-dashboard.png', fullPage: true });

  // Open settings and reset demo data
  await page.locator('button[aria-label="Settings"]').click();
  await expect(page.locator('text=Commitment Radar Settings')).toBeVisible();
  
  // Capture screenshot of settings
  await page.screenshot({ path: 'screenshots/5-settings-modal.png' });
  
  // Reset demo data
  await page.locator('button:has-text("Reset Demo Data")').click();
  await page.locator('button:has-text("Done")').click();
  
  // Verify narrow viewport
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:5173/');
  await page.screenshot({ path: 'screenshots/6-narrow-viewport.png', fullPage: true });
});

test.describe('Mobile Viewport', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('Mobile UX Flows', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    
    // Wait for the main menu button to load
    await expect(page.locator('button[aria-label="Main menu"]').first()).toBeVisible();
    
    // Capture mobile inbox
    await page.screenshot({ path: 'screenshots/mobile-1-inbox.png', fullPage: true });

    // Open a thread
    await page.locator('.flex.flex-col.w-full.md\\:hidden').first().click();
    
    // Capture mobile thread view
    await page.screenshot({ path: 'screenshots/mobile-2-thread.png', fullPage: true });

    // Open Radar panel
    const openCommitmentBtn = page.locator('button:has-text("open commitment")').first();
    if (await openCommitmentBtn.isVisible()) {
      await openCommitmentBtn.click();
      await expect(page.locator('text=Commitment Radar').first()).toBeVisible();
      // Capture mobile radar panel
      await page.screenshot({ path: 'screenshots/mobile-3-radar-drawer.png', fullPage: true });
      // Close Radar panel
      await page.locator('button[aria-label="Close Radar panel"]').click();
    }
    
    // Navigate to dashboard
    await page.locator('button[aria-label="Main menu"]').click();
    await page.locator('nav').locator('text=Commitment Radar').click();
    await expect(page.locator('text=All Open Commitments')).toBeVisible();

    // Capture mobile dashboard
    await page.screenshot({ path: 'screenshots/mobile-4-dashboard.png', fullPage: true });

    // Open Settings
    await page.locator('button[aria-label="Settings"]').click();
    await expect(page.locator('text=Commitment Radar Settings')).toBeVisible();
    
    // Capture mobile settings
    await page.screenshot({ path: 'screenshots/mobile-5-settings.png', fullPage: true });
  });
});

