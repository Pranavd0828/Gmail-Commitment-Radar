import { chromium } from 'playwright';
import { mkdir, rename, rm } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const captureDir = path.join(root, 'artifacts', 'video-capture');
const outputPath = path.join(root, 'artifacts', 'gmail-radar-demo.webm');
const appUrl = 'http://127.0.0.1:5173/';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function ensureCaptionLayer(page) {
  await page.evaluate(() => {
    if (document.getElementById('demo-caption-style')) return;

    const style = document.createElement('style');
    style.id = 'demo-caption-style';
    style.textContent = `
      #demo-caption {
        position: fixed;
        left: 50%;
        bottom: 28px;
        transform: translateX(-50%);
        z-index: 999999;
        max-width: min(920px, calc(100vw - 32px));
        padding: 14px 22px;
        border-radius: 999px;
        background: rgba(32, 33, 36, 0.92);
        color: white;
        font: 600 20px/1.3 Inter, Arial, sans-serif;
        letter-spacing: 0;
        text-align: center;
        box-shadow: 0 12px 36px rgba(0,0,0,0.28);
        backdrop-filter: blur(10px);
        opacity: 0;
        transition: opacity 220ms ease, transform 220ms ease;
        pointer-events: none;
      }
      #demo-caption.visible {
        opacity: 1;
        transform: translateX(-50%) translateY(-4px);
      }
      @media (max-width: 640px) {
        #demo-caption {
          bottom: 18px;
          width: calc(100vw - 28px);
          border-radius: 18px;
          padding: 12px 14px;
          font-size: 15px;
          line-height: 1.35;
        }
      }
    `;
    document.head.appendChild(style);

    const caption = document.createElement('div');
    caption.id = 'demo-caption';
    document.body.appendChild(caption);
  });
}

async function caption(page, text, ms = 5200) {
  await ensureCaptionLayer(page);
  await page.evaluate((value) => {
    const node = document.getElementById('demo-caption');
    node.textContent = value;
    node.classList.add('visible');
  }, text);
  await wait(ms);
}

async function clearCaption(page, ms = 450) {
  await page.evaluate(() => {
    document.getElementById('demo-caption')?.classList.remove('visible');
  });
  await wait(ms);
}

async function clickIfVisible(locator) {
  if (await locator.count()) {
    const first = locator.first();
    if (await first.isVisible()) {
      await first.click();
      return true;
    }
  }
  return false;
}

await rm(captureDir, { recursive: true, force: true });
await mkdir(captureDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  deviceScaleFactor: 1,
  recordVideo: {
    dir: captureDir,
    size: { width: 1280, height: 720 },
  },
});

const page = await context.newPage();

await page.goto(appUrl);
await page.evaluate(() => localStorage.clear());
await page.reload();
await page.waitForLoadState('domcontentloaded');
await ensureCaptionLayer(page);

await caption(page, 'Gmail Radar finds promises, asks, deadlines, and follow-ups hidden in email.', 7000);

await caption(page, 'Inbox badges show what needs attention: You owe, They owe, and Review.', 7000);

await page.locator('button:has-text("You owe")').first().click();
await page.waitForTimeout(700);
await caption(page, 'Open a thread: the exact source phrase is highlighted inside the email.', 7000);

await caption(page, 'The Radar panel explains the commitment, risk, owner, due date, and next action.', 7000);

await clickIfVisible(page.locator('button:has-text("Why am I seeing this?")'));
await page.waitForTimeout(500);
await caption(page, 'The AI rationale is transparent: confidence, reasoning, and quick correction controls.', 7000);

await clickIfVisible(page.locator('button:has-text("Draft reply")'));
await page.waitForTimeout(700);
await caption(page, 'Draft Reply opens the inline composer in the right thread, ready to simulate sending.', 7000);

await clickIfVisible(page.locator('button[aria-label="Add to Calendar"]').first());
await page.waitForTimeout(500);
await caption(page, 'Calendar and Tasks actions are safe simulations: no real data leaves the prototype.', 7000);

await clickIfVisible(page.locator('button:has-text("Close")'));
await page.waitForTimeout(300);
await clickIfVisible(page.locator('button[aria-label="Close Radar panel"]'));
await page.waitForTimeout(300);
await page.locator('nav').locator('text=Commitment Radar').click();
await page.waitForTimeout(600);
await caption(page, 'The dashboard gives one place to search, sort, and review every detected commitment.', 7000);

await page.locator('button[aria-label="Settings"]').click();
await page.waitForTimeout(500);
await caption(page, 'Settings control badges, review items, automated-email filtering, and demo reset.', 6500);
await clickIfVisible(page.locator('button:has-text("Done")'));
await page.waitForTimeout(500);

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(appUrl);
await page.waitForLoadState('domcontentloaded');
await ensureCaptionLayer(page);
await caption(page, 'On mobile, Gmail Radar switches to compact rows with clear commitment signals.', 7000);

await page.locator('button[aria-label="Open search"]').click();
await page.waitForTimeout(500);
await caption(page, 'Mobile search gets its own focused overlay, preserving space on small screens.', 6500);
await page.locator('button[aria-label="Close search"]').click();
await page.waitForTimeout(400);

await page.locator('button[aria-label^="Commitment:"]').first().click();
await page.waitForTimeout(700);
await caption(page, 'Tap a mobile Radar chip to open the thread and the full-screen Radar drawer.', 7000);

await clickIfVisible(page.locator('button[aria-label="Close Radar panel"]'));
await page.waitForTimeout(500);
await caption(page, 'The thread view is compact, readable, and keeps the source highlight visible.', 7000);

await page.locator('button:has-text("open commitment")').first().click();
await page.waitForTimeout(500);
await caption(page, 'The mobile Radar drawer keeps triage actions large enough for touch.', 7000);
await clickIfVisible(page.locator('button[aria-label="Close Radar panel"]'));
await page.waitForTimeout(300);

await page.locator('button[aria-label="Main menu"]').click();
await page.waitForTimeout(400);
await page.locator('nav').locator('text=Commitment Radar').click();
await page.waitForTimeout(600);
await caption(page, 'The mobile dashboard stacks metrics and commitment cards without horizontal scrolling.', 7000);

await page.locator('button[aria-label="Settings"]').click();
await page.waitForTimeout(500);
await caption(page, 'Mobile settings and simulation dialogs become bottom sheets that fit the viewport.', 7000);
await clickIfVisible(page.locator('button:has-text("Done")'));
await page.waitForTimeout(500);

await caption(page, 'Gmail Radar is a polished desktop and mobile prototype for AI-powered commitment tracking.', 7500);
await clearCaption(page, 900);

const video = page.video();
await page.close();
await context.close();
await browser.close();

const videoPath = await video.path();
await rm(outputPath, { force: true });
await rename(videoPath, outputPath);

console.log(outputPath);
