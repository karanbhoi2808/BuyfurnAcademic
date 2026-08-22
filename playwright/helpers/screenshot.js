const fs = require('fs');
const path = require('path');
const { waitForPageReady } = require('./wait-for-page');

/**
 * Capture full-page screenshot for a specified route and viewport
 * @param {import('playwright').Page} page 
 * @param {Object} routeConfig 
 * @param {Object} viewportConfig 
 * @param {string} baseOutputDir 
 */
async function captureRouteScreenshot(page, routeConfig, viewportConfig, baseOutputDir) {
  const startTime = Date.now();
  const viewportName = viewportConfig.name; // 'desktop' or 'mobile'
  const accessCategory = routeConfig.access; // 'public', 'user', 'admin'

  const targetDir = path.join(baseOutputDir, viewportName, accessCategory);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const filePath = path.join(targetDir, routeConfig.screenshotFilename);

  try {
    // Wait for angular component, networkidle, fonts, images
    await waitForPageReady(page, routeConfig);

    // Capture full page screenshot
    await page.screenshot({
      path: filePath,
      fullPage: true
    });

    const duration = Date.now() - startTime;
    console.log(`[SCREENSHOT] Captured ${viewportName}/${accessCategory}/${routeConfig.screenshotFilename} in ${duration}ms`);

    return {
      success: true,
      route: routeConfig.name,
      path: routeConfig.path,
      access: routeConfig.access,
      viewport: viewportName,
      filePath: path.relative(process.cwd(), filePath),
      durationMs: duration
    };
  } catch (err) {
    const errorsDir = path.join(baseOutputDir, 'errors');
    if (!fs.existsSync(errorsDir)) {
      fs.mkdirSync(errorsDir, { recursive: true });
    }

    const errorScreenshotPath = path.join(errorsDir, `${routeConfig.name}-${viewportName}-error.png`);
    try {
      await page.screenshot({ path: errorScreenshotPath, fullPage: true });
    } catch (_) {}

    console.error(`[SCREENSHOT] Failed capturing ${routeConfig.name} (${viewportName}): ${err.message}`);

    return {
      success: false,
      route: routeConfig.name,
      path: routeConfig.path,
      access: routeConfig.access,
      viewport: viewportName,
      error: err.message,
      errorScreenshotPath: path.relative(process.cwd(), errorScreenshotPath)
    };
  }
}

module.exports = {
  captureRouteScreenshot
};
