const fs = require('fs');
const path = require('path');

const AUTH_DIR = path.join(__dirname, '..', '.auth');

function ensureAuthDir() {
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }
}

/**
 * Perform authentication for a specific role ('USER' or 'ADMIN')
 * @param {import('playwright').Browser} browser 
 * @param {'USER'|'ADMIN'} role 
 * @param {string} baseURL 
 */
async function authenticateRole(browser, role, baseURL) {
  ensureAuthDir();
  const authFilePath = path.join(AUTH_DIR, `${role.toLowerCase()}.json`);

  const email = role === 'ADMIN' ? process.env.BUYFURN_ADMIN_EMAIL : process.env.BUYFURN_USER_EMAIL;
  const password = role === 'ADMIN' ? process.env.BUYFURN_ADMIN_PASSWORD : process.env.BUYFURN_USER_PASSWORD;

  if (!email || !password || email.trim() === '' || password.trim() === '') {
    console.warn(`[AUTH] ${role} credentials not configured in environment. Skipping authenticated ${role} screenshots.`);
    return { success: false, reason: 'missing_credentials' };
  }

  console.log(`[AUTH] Authenticating ${role} (${email})...`);
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(`${baseURL}/login`, { waitUntil: 'networkidle' });

    // Fill login form
    await page.fill('#email', email);
    await page.fill('#password', password);
    await page.click('button[type="submit"]');

    // Wait for login response/navigation
    await page.waitForTimeout(1500);

    // Check if error message is displayed
    const errorElement = await page.$('.text-danger');
    let errorMessage = null;
    if (errorElement) {
      errorMessage = await errorElement.textContent();
    }

    const currentUrl = page.url();
    const isLoggedIn = !currentUrl.endsWith('/login') || (await page.evaluate(() => !!localStorage.getItem('basicAuth')));

    if (isLoggedIn && !errorMessage) {
      await context.storageState({ path: authFilePath });
      console.log(`[AUTH] ${role} authentication successful. Storage state saved to ${authFilePath}`);
      await context.close();
      return { success: true, authFile: authFilePath };
    } else {
      const errorMsg = errorMessage ? errorMessage.trim() : `Login failed at URL: ${currentUrl}`;
      console.error(`[AUTH] ${role} login failed: ${errorMsg}`);

      // Save diagnostic screenshot
      const errorsDir = path.join(__dirname, '..', '..', 'screenshots', 'errors');
      if (!fs.existsSync(errorsDir)) fs.mkdirSync(errorsDir, { recursive: true });
      await page.screenshot({ path: path.join(errorsDir, `login-${role.toLowerCase()}-error.png`), fullPage: true });

      await context.close();
      return { success: false, error: errorMsg };
    }
  } catch (err) {
    console.error(`[AUTH] Error during ${role} authentication: ${err.message}`);
    const errorsDir = path.join(__dirname, '..', '..', 'screenshots', 'errors');
    if (!fs.existsSync(errorsDir)) fs.mkdirSync(errorsDir, { recursive: true });
    try {
      await page.screenshot({ path: path.join(errorsDir, `login-${role.toLowerCase()}-error.png`), fullPage: true });
    } catch (_) {}
    await context.close();
    return { success: false, error: err.message };
  }
}

/**
 * Inject fallback mock storage state for testing pages when backend is offline or credentials not configured
 */
async function setupMockAuthState(context, role, baseURL = 'http://localhost:4200', email = 'test@buyfurn.com', name = 'Test User') {
  const page = await context.newPage();
  try {
    await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
    const authHeader = 'Basic ' + Buffer.from(`${email}:password`).toString('base64');
    await page.evaluate(({ role, email, name, authHeader }) => {
      localStorage.setItem('roles', JSON.stringify([role]));
      localStorage.setItem('basicAuth', authHeader);
      localStorage.setItem('email', email);
      localStorage.setItem('name', name);
    }, { role, email, name, authHeader });
  } catch (err) {
    console.warn(`[AUTH] Failed setting up mock auth state for ${role}: ${err.message}`);
  } finally {
    await page.close();
  }
}

module.exports = {
  authenticateRole,
  setupMockAuthState
};
