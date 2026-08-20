/**
 * Playwright Route Navigation Helper
 * Handles standard and dynamic parameter routes for BuyFurn
 */

/**
 * Navigate page to target route based on configuration
 * @param {import('playwright').Page} page 
 * @param {Object} routeConfig 
 * @param {string} baseURL 
 */
async function navigateToRoute(page, routeConfig, baseURL) {
  let targetPath = routeConfig.path;

  // Handle special route cases requiring query parameters or data
  if (routeConfig.name === 'product-detail' || routeConfig.path === '/product') {
    // Attempt to discover a valid product ID or default to productId=1
    targetPath = '/product?productId=1';
  } else if (routeConfig.name === 'buyproduct' || routeConfig.path === '/buyproduct') {
    // BuyProductResolver expects id & isSingleProductCheckout query params
    targetPath = '/buyproduct?isSingleProductCheckout=true&id=1';
  } else if (routeConfig.name === 'admin-productdetails') {
    targetPath = '/admin/productdetails?productId=1';
  }

  const targetURL = `${baseURL}${targetPath}`;
  console.log(`[NAV] Navigating to ${routeConfig.name} (${targetURL})...`);

  try {
    const response = await page.goto(targetURL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    return { success: true, url: page.url(), statusCode: response ? response.status() : 200 };
  } catch (err) {
    console.error(`[NAV] Failed navigating to ${targetURL}: ${err.message}`);
    return { success: false, error: err.message };
  }
}

module.exports = {
  navigateToRoute
};
