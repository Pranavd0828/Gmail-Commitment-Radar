import { chromium } from 'playwright';
import { execFile } from 'node:child_process';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const root = process.cwd();
const artifactsDir = path.join(root, 'artifacts');
const captureDir = path.join(artifactsDir, 'video-capture-narrated');
const framesDir = path.join(captureDir, 'frames');
const narrationWavPath = path.join(artifactsDir, 'gmail-radar-demo-narration.wav');
const outputPath = path.join(artifactsDir, 'gmail-radar-demo-narrated.webm');
const muxPagePath = path.join(artifactsDir, 'mux-narrated-demo.html');
const appUrl = 'http://127.0.0.1:5173/';
const captureFps = 10;

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
The Commitment Radar dashboard gives a single place to search, sort, and review all detected follow-ups.
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
  if (await locator.count()) {
    const first = locator.first();
    if (await first.isVisible()) {
      await first.click();
      return true;
    }
  }
  return false;
}

async function recordSilentWalkthrough() {
  await rm(captureDir, { recursive: true, force: true });
  await mkdir(captureDir, { recursive: true });
  await mkdir(framesDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
  });
  await context.addInitScript(() => {
    window.localStorage.clear();
  });

  const page = await context.newPage();
  await page.goto(appUrl);
  await page.waitForLoadState('domcontentloaded');
  await ensureCaptionLayer(page);

  let capturing = true;
  let frameIndex = 0;
  const captureLoop = (async () => {
    while (capturing) {
      const startedAt = Date.now();
      const filename = `${String(frameIndex).padStart(5, '0')}.jpg`;
      await page.screenshot({
        path: path.join(framesDir, filename),
        type: 'jpeg',
        quality: 88,
        animations: 'allow',
      });
      frameIndex += 1;
      const elapsed = Date.now() - startedAt;
      await wait(Math.max(0, Math.round(1000 / captureFps) - elapsed));
    }
  })();

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

  await page.locator('button[aria-label="Open search"]').click();
  await page.waitForTimeout(400);
  await caption(page, 'Mobile search opens as a focused full-width overlay.', 4500);
  await page.locator('button[aria-label="Close search"]').click();
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

  capturing = false;
  await captureLoop;

  await page.close();
  await context.close();
  await browser.close();
}

async function createNarration() {
  await execFileAsync('say', [
    '-r',
    '168',
    '-o',
    narrationWavPath,
    '--file-format=WAVE',
    '--data-format=LEI16@22050',
    narrationText,
  ]);
}

async function muxVideoAndNarration() {
  const server = createServer(async (request, response) => {
    const requestUrl = new URL(request.url || '/', 'http://127.0.0.1');
    const decodedPath = decodeURIComponent(requestUrl.pathname.replace(/^\/+/, ''));
    const filePath = path.resolve(artifactsDir, decodedPath);
    if (!filePath.startsWith(artifactsDir)) {
      response.writeHead(403);
      response.end('Forbidden');
      return;
    }
    const extension = path.extname(filePath);
    const contentType = extension === '.html'
      ? 'text/html'
      : extension === '.jpg'
        ? 'image/jpeg'
        : 'application/octet-stream';
    try {
      const data = await readFile(filePath);
      response.writeHead(200, { 'Content-Type': contentType });
      response.end(data);
    } catch {
      response.writeHead(404);
      response.end('Not found');
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const serverAddress = server.address();
  const serverPort = typeof serverAddress === 'object' && serverAddress ? serverAddress.port : 0;
  const artifactUrl = (filePath) => {
    const relative = path.relative(artifactsDir, filePath).split(path.sep).map(encodeURIComponent).join('/');
    return `http://127.0.0.1:${serverPort}/${relative}`;
  };

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const { readdir } = await import('node:fs/promises');
  const frameUrls = (await readdir(framesDir))
    .filter((name) => name.endsWith('.jpg'))
    .sort()
    .map((name) => artifactUrl(path.join(framesDir, name)));
  const audioBase64 = (await readFile(narrationWavPath)).toString('base64');

  await writeFile(muxPagePath, `
    <!doctype html>
    <html>
      <body style="margin:0;background:#000;overflow:hidden">
        <canvas id="canvas" width="1280" height="720"></canvas>
      </body>
    </html>
  `);
  await page.goto(artifactUrl(muxPagePath));

  const bytes = await page.evaluate(async ({ frameUrls, captureFps, audioBase64 }) => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d', { alpha: false });

    const audioContext = new AudioContext();
    const binary = atob(audioBase64);
    const audioBytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      audioBytes[index] = binary.charCodeAt(index);
    }
    const audioBuffer = await audioContext.decodeAudioData(audioBytes.buffer);
    const audioSource = audioContext.createBufferSource();
    audioSource.buffer = audioBuffer;
    const audioDestination = audioContext.createMediaStreamDestination();
    audioSource.connect(audioDestination);

    const stream = canvas.captureStream(30);
    if (!stream.getVideoTracks().length) {
      throw new Error('Canvas capture did not produce a video track.');
    }
    const audioTrack = audioDestination.stream.getAudioTracks()[0];
    if (audioTrack) stream.addTrack(audioTrack);

    const mimeType = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ].find((candidate) => MediaRecorder.isTypeSupported(candidate));
    if (!mimeType) {
      throw new Error('No supported WebM MediaRecorder MIME type found.');
    }

    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 6500000,
      audioBitsPerSecond: 160000,
    });

    const chunks = [];
    recorder.addEventListener('dataavailable', (event) => {
      if (event.data.size) chunks.push(event.data);
    });

    const loadImage = (src) => new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Frame failed to load: ${src}`));
      image.src = src;
    });

    const drawImageContain = (image) => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const imageRatio = image.width / image.height;
      const canvasRatio = canvas.width / canvas.height;
      let drawWidth = canvas.width;
      let drawHeight = canvas.height;
      if (imageRatio > canvasRatio) {
        drawHeight = canvas.width / imageRatio;
      } else {
        drawWidth = canvas.height * imageRatio;
      }
      const x = (canvas.width - drawWidth) / 2;
      const y = (canvas.height - drawHeight) / 2;
      ctx.drawImage(image, x, y, drawWidth, drawHeight);
    };

    const done = new Promise((resolve) => recorder.addEventListener('stop', resolve, { once: true }));

    recorder.start(1000);
    await audioContext.resume();
    audioSource.start();
    const frameDelay = 1000 / captureFps;
    for (const frameUrl of frameUrls) {
      const image = await loadImage(frameUrl);
      drawImageContain(image);
      await new Promise((resolve) => setTimeout(resolve, frameDelay));
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (recorder.state !== 'inactive') {
      recorder.requestData();
      await new Promise((resolve) => setTimeout(resolve, 250));
      recorder.stop();
    }
    await done;
    if (!chunks.length) {
      throw new Error(`MediaRecorder produced no chunks with ${mimeType}.`);
    }

    const blob = new Blob(chunks, { type: 'video/webm' });
    return Array.from(new Uint8Array(await blob.arrayBuffer()));
  }, { frameUrls, captureFps, audioBase64 });

  await browser.close();
  await new Promise((resolve) => server.close(resolve));
  await rm(outputPath, { force: true });
  await writeFile(outputPath, Buffer.from(bytes));
}

await mkdir(artifactsDir, { recursive: true });
if (process.env.SKIP_CAPTURE !== '1') {
  await recordSilentWalkthrough();
}
await createNarration();
await muxVideoAndNarration();

const stat = await readFile(outputPath);
console.log(outputPath);
console.log(`${(stat.byteLength / 1024 / 1024).toFixed(1)} MB`);
