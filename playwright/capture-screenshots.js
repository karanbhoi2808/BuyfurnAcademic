require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const routes = require('./config/routes');
const { authenticateRole, setupMockAuthState } = require('./helpers/auth');
const { navigateToRoute } = require('./helpers/navigation');
const { captureRouteScreenshot } = require('./helpers/screenshot');

const DEFAULT_BASE_URL = process.env.BUYFURN_BASE_URL || 'http://localhost:4200';
const BASE_OUTPUT_DIR = path.join(__dirname, '..', 'screenshots');

const VIEWPORTS = {
  desktop: { name: 'desktop', width: 1440, height: 1000 },
  mobile: { name: 'mobile', width: 390, height: 844 }
};

// Parse CLI arguments
const args = process.argv.slice(2);
let selectedViewports = [];
let customBaseURL = DEFAULT_BASE_URL;

for (const arg of args) {
  if (arg === '--desktop') selectedViewports.push(VIEWPORTS.desktop);
  else if (arg === '--mobile') selectedViewports.push(VIEWPORTS.mobile);
  else if (arg === '--all') selectedViewports = [VIEWPORTS.desktop, VIEWPORTS.mobile];
  else if (arg.startsWith('--url=')) customBaseURL = arg.split('=')[1];
}

if (selectedViewports.length === 0) {
  selectedViewports = [VIEWPORTS.desktop, VIEWPORTS.mobile];
}

async function runScreenshotAutomation() {
  console.log('====================================================');
  console.log('       BuyFurn Playwright Screenshot Automation      ');
  console.log('====================================================');
  console.log(`Target Application URL: ${customBaseURL}`);
  console.log(`Target Viewports: ${selectedViewports.map(v => v.name).join(', ')}`);
  console.log(`Total Routes Configured: ${routes.length}`);
  console.log('----------------------------------------------------\n');

  if (!fs.existsSync(BASE_OUTPUT_DIR)) {
    fs.mkdirSync(BASE_OUTPUT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });

  // 1. Authenticate roles if credentials exist
  console.log('[AUTH] Checking environment authentication credentials...');
  const userAuthResult = await authenticateRole(browser, 'USER', customBaseURL);
  const adminAuthResult = await authenticateRole(browser, 'ADMIN', customBaseURL);

  const reportData = {
    timestamp: new Date().toISOString(),
    baseURL: customBaseURL,
    totalRoutes: routes.length * selectedViewports.length,
    successful: 0,
    failed: 0,
    skipped: 0,
    details: []
  };

  const manifestData = [];

  for (const viewport of selectedViewports) {
    console.log(`\n========================================`);
    console.log(` Capturing ${viewport.name.toUpperCase()} Viewport (${viewport.width}x${viewport.height})`);
    console.log(`========================================`);

    // Create contexts for public, user, admin
    const publicContext = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });

    let userContext;
    if (userAuthResult.success) {
      userContext = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        storageState: userAuthResult.authFile
      });
    } else {
      userContext = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
      await setupMockAuthState(userContext, 'USER', customBaseURL);
    }

    let adminContext;
    if (adminAuthResult.success) {
      adminContext = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        storageState: adminAuthResult.authFile
      });
    } else {
      adminContext = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
      await setupMockAuthState(adminContext, 'ADMIN', customBaseURL);
    }

    for (const routeConfig of routes) {
      let activeContext;
      if (routeConfig.access === 'public') {
        activeContext = publicContext;
      } else if (routeConfig.access === 'user') {
        activeContext = userContext;
      } else if (routeConfig.access === 'admin') {
        activeContext = adminContext;
      }

      const page = await activeContext.newPage();

      try {
        const navResult = await navigateToRoute(page, routeConfig, customBaseURL);

        if (!navResult.success) {
          reportData.failed++;
          reportData.details.push({
            route: routeConfig.name,
            path: routeConfig.path,
            access: routeConfig.access,
            viewport: viewport.name,
            status: 'FAILED',
            error: navResult.error
          });
          await page.close();
          continue;
        }

        const screenshotResult = await captureRouteScreenshot(page, routeConfig, viewport, BASE_OUTPUT_DIR);

        if (screenshotResult.success) {
          reportData.successful++;
          reportData.details.push({
            route: routeConfig.name,
            path: routeConfig.path,
            access: routeConfig.access,
            viewport: viewport.name,
            status: 'SUCCESS',
            file: screenshotResult.filePath,
            durationMs: screenshotResult.durationMs
          });

          manifestData.push({
            name: routeConfig.name,
            path: routeConfig.path,
            access: routeConfig.access,
            role: routeConfig.role,
            viewport: viewport.name,
            screenshot: screenshotResult.filePath,
            notes: routeConfig.notes
          });
        } else {
          reportData.failed++;
          reportData.details.push({
            route: routeConfig.name,
            path: routeConfig.path,
            access: routeConfig.access,
            viewport: viewport.name,
            status: 'FAILED',
            error: screenshotResult.error,
            errorScreenshot: screenshotResult.errorScreenshotPath
          });
        }
      } catch (err) {
        console.error(`[ERROR] Unexpected error capturing ${routeConfig.name}: ${err.message}`);
        reportData.failed++;
        reportData.details.push({
          route: routeConfig.name,
          path: routeConfig.path,
          access: routeConfig.access,
          viewport: viewport.name,
          status: 'FAILED',
          error: err.message
        });
      } finally {
        await page.close();
      }
    }

    await publicContext.close();
    await userContext.close();
    await adminContext.close();
  }

  await browser.close();

  // Save report and manifest
  fs.writeFileSync(path.join(BASE_OUTPUT_DIR, 'report.json'), JSON.stringify(reportData, null, 2));
  fs.writeFileSync(path.join(BASE_OUTPUT_DIR, 'manifest.json'), JSON.stringify(manifestData, null, 2));

  console.log('\n====================================================');
  console.log('               Execution Summary Report             ');
  console.log('====================================================');
  console.log(`Total Captures Attempted: ${reportData.totalRoutes}`);
  console.log(`Successfully Captured   : ${reportData.successful}`);
  console.log(`Failed Captures         : ${reportData.failed}`);
  console.log(`Skipped Captures        : ${reportData.skipped}`);
  console.log(`\nArtifacts Generated:`);
  console.log(`  - Manifest: ${path.join(BASE_OUTPUT_DIR, 'manifest.json')}`);
  console.log(`  - Report  : ${path.join(BASE_OUTPUT_DIR, 'report.json')}`);
  console.log('====================================================\n');
}

runScreenshotAutomation().catch(err => {
  console.error('Fatal screenshot automation error:', err);
  process.exit(1);
});
