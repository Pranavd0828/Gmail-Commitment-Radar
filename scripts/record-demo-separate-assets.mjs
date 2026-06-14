import { chromium } from 'playwright';
import { execFile } from 'node:child_process';
import { mkdir, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const root = process.cwd();
const artifactsDir = path.join(root, 'artifacts');
const captureDir = path.join(artifactsDir, 'video-capture-separate');
const videoPath = path.join(artifactsDir, 'gmail-radar-demo-captioned-video.webm');
const audioPath = path.join(artifactsDir, 'gmail-radar-demo-narration.wav');
const transcriptPath = path.join(artifactsDir, 'gmail-radar-demo-narration.txt');
const appUrl = 'http://127.0.0.1:5173/';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const narrationText = `
This is Gmail Radar, a prototype that finds commitments hidden inside email.
On the desktop inbox, each row keeps the familiar Gmail shape, but adds small Radar signals.
You can quickly see what you owe, what someone else owes, and what needs review.
Opening a message takes us to the real source email, where the exact phrase behind the commitment is highlighted.
The Radar panel explains what it found: the owner, the deadline, the risk level, and the suggested next step.
The explanation view shows why the AI made the call, with confidence and correction controls.
Draft Reply opens an inline composer in the same thread, so the user can act without losing context.
Calendar and task actions are safe simulations. They show what would be created, but do not touch real Google data.
The Commitment Radar dashboard gives one place to search, sort, and review all detected follow-ups.
Settings let the user tune badges, review items, automated email filtering, and demo reset behavior.
On mobile, the experience becomes compact and touch friendly.
Rows use smaller commitment signals, search opens as a focused overlay, and the Radar panel becomes a full-screen drawer.
The mobile dashboard stacks metrics and cards cleanly, so there is no horizontal scrolling.
Overall, this prototype shows how Gmail could become a lightweight commitment tracking system across desktop and mobile.
`.replace(/\s+/g, ' ').trim();

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
        max-width: min(960px, calc(100vw - 32px));
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

async function caption(page, text, ms = 5000) {
  await ensureCaptionLayer(page);
  await page.evaluate((value) => {
    const node = document.getElementById('demo-caption');
    node.textContent = value;
    node.classList.add('visible');
  }, text);
  await wait(ms);
}

async function clearCaption(page, ms = 300) {
  await page.evaluate(() => {
    document.getElementById('demo-caption')?.classList.remove('visible');
  });
  await wait(ms);
}

async function clickIfVisible(locator) {
  if (!(await locator.count())) return false;
  const first = locator.first();
  if (!(await first.isVisible())) return false;
  await first.click();
  return true;
}

async function createAudio() {
  await writeFile(transcriptPath, `${narrationText}\n`);
  await rm(audioPath, { force: true });
  await execFileAsync('say', [
    '-r',
    '168',
    '-o',
    audioPath,
    '--file-format=WAVE',
    '--data-format=LEI16@22050',
    narrationText,
  ]);
}

async function createCaptionedVideo() {
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
  await context.addInitScript(() => {
    window.localStorage.clear();
  });

  const page = await context.newPage();
  await page.goto(appUrl);
  await page.waitForLoadState('domcontentloaded');
  await ensureCaptionLayer(page);

  await caption(page, 'Gmail Radar finds commitments hidden inside email.', 4800);
  await caption(page, 'Inbox signals show: You owe, They owe, and Review.', 4800);

  await page.locator('button:has-text("You owe")').first().click();
  await page.waitForTimeout(500);
  await caption(page, 'Open a thread to see the exact source phrase highlighted.', 5600);
  await caption(page, 'The Radar panel explains owner, deadline, risk, and next action.', 5600);

  await clickIfVisible(page.locator('button:has-text("Why am I seeing this?")'));
  await page.waitForTimeout(400);
  await caption(page, 'The AI rationale shows confidence, reasoning, and correction controls.', 5200);

  await clickIfVisible(page.locator('button:has-text("Draft reply")'));
  await page.waitForTimeout(500);
  await caption(page, 'Draft Reply opens an inline composer in the same thread.', 5000);

  await clickIfVisible(page.locator('button[aria-label="Add to Calendar"]').first());
  await page.waitForTimeout(500);
  await caption(page, 'Calendar and Tasks are safe simulations, not real Google writes.', 5200);
  await clickIfVisible(page.locator('button:has-text("Close")'));
  await page.waitForTimeout(250);

  await clickIfVisible(page.locator('button[aria-label="Close Radar panel"]'));
  await page.waitForTimeout(250);
  await page.locator('nav').locator('text=Commitment Radar').click();
  await page.waitForTimeout(500);
  await caption(page, 'The dashboard searches, sorts, and reviews every detected commitment.', 5600);

  await page.locator('button[aria-label="Settings"]').click();
  await page.waitForTimeout(400);
  await caption(page, 'Settings tune badges, review items, automation filtering, and reset.', 5000);
  await clickIfVisible(page.locator('button:has-text("Done")'));
  await page.waitForTimeout(350);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForFunction(() => window.innerWidth < 640);
  await page.goto(appUrl);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForFunction(() => window.innerWidth < 640);
  await ensureCaptionLayer(page);

  await caption(page, 'On mobile, rows become compact and touch friendly.', 5000);

  await clickIfVisible(page.locator('button[aria-label="Open search"]'));
  await page.waitForTimeout(400);
  await caption(page, 'Mobile search opens as a focused full-width overlay.', 4500);
  await clickIfVisible(page.locator('button[aria-label="Close search"]'));
  await page.waitForTimeout(300);

  await page.locator('button[aria-label^="Commitment:"]').first().click();
  await page.waitForTimeout(600);
  await caption(page, 'Tapping a signal opens the thread and full-screen Radar drawer.', 5600);

  await clickIfVisible(page.locator('button[aria-label="Close Radar panel"]'));
  await page.waitForTimeout(300);
  await caption(page, 'The thread stays readable, with the source highlight preserved.', 5000);

  await page.locator('button:has-text("open commitment")').first().click();
  await page.waitForTimeout(400);
  await caption(page, 'Mobile triage actions stay large enough for touch.', 4800);
  await clickIfVisible(page.locator('button[aria-label="Close Radar panel"]'));
  await page.waitForTimeout(300);

  await page.locator('button[aria-label="Main menu"]').click();
  await page.waitForTimeout(350);
  await page.locator('nav').locator('text=Commitment Radar').click();
  await page.waitForTimeout(500);
  await caption(page, 'The mobile dashboard stacks metrics and cards without side scrolling.', 5300);

  await page.locator('button[aria-label="Settings"]').click();
  await page.waitForTimeout(400);
  await caption(page, 'Mobile settings and simulation dialogs become viewport-safe sheets.', 5000);
  await clickIfVisible(page.locator('button:has-text("Done")'));
  await page.waitForTimeout(300);

  await caption(page, 'Gmail Radar turns email into a desktop and mobile commitment tracker.', 5600);
  await clearCaption(page, 700);

  const video = page.video();
  await page.close();
  await context.close();
  await browser.close();

  const recordedPath = await video.path();
  await rm(videoPath, { force: true });
  await rename(recordedPath, videoPath);
}

await mkdir(artifactsDir, { recursive: true });
await createAudio();
await createCaptionedVideo();

console.log(videoPath);
console.log(audioPath);
console.log(transcriptPath);
