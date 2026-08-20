/**
 * Helper to ensure page is fully loaded and settled before taking a screenshot
 */

async function waitForPageReady(page, routeConfig) {
  // 1. Wait for basic load state
  try {
    await page.waitForLoadState('networkidle', { timeout: 5000 });
  } catch (_) {
    // Fallback if networkidle times out due to polling
    await page.waitForLoadState('domcontentloaded');
  }

  // 2. Wait for Angular application container
  try {
    await page.waitForSelector('app-root', { state: 'attached', timeout: 5000 });
  } catch (_) {}

  // 3. Route specific waits if applicable
  if (routeConfig.path === '/furniture') {
    try {
      await page.waitForSelector('app-product-section', { state: 'visible', timeout: 4000 });
    } catch (_) {}
  } else if (routeConfig.path === '/admin') {
    try {
      await page.waitForSelector('app-dashbordcomponet', { state: 'attached', timeout: 4000 });
    } catch (_) {}
  }

  // 4. Wait for images to load
  try {
    await page.evaluate(async () => {
      const selectors = Array.from(document.querySelectorAll('img'));
      await Promise.all(
        selectors.map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );
    });
  } catch (_) {}

  // 5. Hide temporary toast notifications or debug overlays if present
  try {
    await page.addStyleTag({
      content: `
        .swal2-container, .toast, .cdk-overlay-container:empty {
          display: none !important;
        }
      `
    });
  } catch (_) {}

  // 6. Brief pause for rendering and CSS transitions to settle
  await page.waitForTimeout(600);
}

module.exports = {
  waitForPageReady
};
