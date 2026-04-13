import { chromium, devices } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.APP_URL || "http://127.0.0.1:5173";
const OUTPUT_DIR = path.resolve(process.cwd(), "presentation-screenshots");

const pages = [
  { key: "overview", navLabel: "Overview" },
  { key: "sign-journal", navLabel: "Sign Journal" },
  { key: "visual-therapy", navLabel: "Visual Therapy" },
  { key: "ai-insights", navLabel: "AI Insights" },
  { key: "dhh-community", navLabel: "DHH Community" },
];

async function captureDesktop(context) {
  const page = await context.newPage();
  await page.goto(BASE_URL, { waitUntil: "networkidle" });

  for (const item of pages) {
    // Try multiple selectors to find the navigation button
    const button =
      page.getByRole("button", { name: item.navLabel, exact: true }) ||
      page.getByLabel(item.navLabel) ||
      page.locator(`button:has-text("${item.navLabel}")`);

    try {
      await button.click({ timeout: 5000 });
    } catch (e) {
      console.log(
        `Could not click ${item.navLabel}, trying alternative navigation...`,
      );
      // Try hash-based navigation if button click fails
      await page.goto(`${BASE_URL}#/${item.key}`, { waitUntil: "networkidle" });
    }

    await page.waitForTimeout(800);
    const filePath = path.join(OUTPUT_DIR, `desktop-${item.key}.png`);
    await page.screenshot({ path: filePath, fullPage: true });
    console.log(`Saved ${filePath}`);
  }

  await page.close();
}

async function captureMobile(browser) {
  const pixel7 = devices["Pixel 7"];
  const context = await browser.newContext({ ...pixel7 });
  const page = await context.newPage();
  await page.goto(BASE_URL, { waitUntil: "networkidle" });

  for (const item of pages) {
    // Try multiple selectors to find the navigation button
    const button =
      page.getByRole("button", { name: item.navLabel, exact: true }) ||
      page.getByLabel(item.navLabel) ||
      page.locator(`button:has-text("${item.navLabel}")`);

    try {
      await button.click({ timeout: 5000 });
    } catch (e) {
      console.log(
        `Could not click ${item.navLabel}, trying alternative navigation...`,
      );
      // Try hash-based navigation if button click fails
      await page.goto(`${BASE_URL}#/${item.key}`, { waitUntil: "networkidle" });
    }

    await page.waitForTimeout(800);
    const filePath = path.join(OUTPUT_DIR, `mobile-${item.key}.png`);
    await page.screenshot({ path: filePath, fullPage: true });
    console.log(`Saved ${filePath}`);
  }

  await context.close();
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });

  try {
    const desktopContext = await browser.newContext({
      viewport: { width: 1600, height: 900 },
      deviceScaleFactor: 2,
    });

    await captureDesktop(desktopContext);
    await desktopContext.close();

    await captureMobile(browser);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});
