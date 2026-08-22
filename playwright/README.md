# BuyFurn Playwright Screenshot Automation System

This repository contains a dedicated, isolated **Playwright screenshot automation system** for the BuyFurn Angular application. It generates full-page visual references of all public, user-authenticated, and admin-authenticated pages in desktop and mobile viewports. These screenshots serve as precise baseline references for UI redesign in **Stitch AI**.

---

## 1. Installation

Install project dependencies including Playwright:

```bash
npm install
```

---

## 2. Browser Installation

Install the required Playwright Chromium browser binary:

```bash
npx playwright install chromium
```

---

## 3. Environment Variables Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

The default values in `.env` are:

```env
BUYFURN_BASE_URL=http://localhost:4200

# User Credentials
BUYFURN_USER_EMAIL=user@buyfurn.com
BUYFURN_USER_PASSWORD=userpass

# Admin Credentials
BUYFURN_ADMIN_EMAIL=admin@buyfurn.com
BUYFURN_ADMIN_PASSWORD=adminpass
```

- `BUYFURN_BASE_URL`: Base URL of the running Angular application (default: `http://localhost:4200`).
- `BUYFURN_USER_EMAIL` & `BUYFURN_USER_PASSWORD`: Credentials for customer account.
- `BUYFURN_ADMIN_EMAIL` & `BUYFURN_ADMIN_PASSWORD`: Credentials for administrator account.

---

## 4. How Authenticated Screenshots Work

1. If credentials are missing or blank, the runner logs a notice and uses fallback state handling so public and dependent screenshots can still be generated without crashing.
2. When credentials are supplied, Playwright logs in through `/login`, acquires authentication tokens/cookies, and saves session state into:
   - `playwright/.auth/user.json`
   - `playwright/.auth/admin.json`
3. Both files are automatically `.gitignore`'d for security.

---

## 5. Starting the BuyFurn Application

In **Terminal 1**, launch the Angular development server:

```bash
npm start
```

Verify that the application is running at `http://localhost:4200`.

---

## 6. Capturing Screenshots

In **Terminal 2**, execute any of the following npm scripts:

### Capture All Screenshots (Desktop + Mobile)

```bash
npm run screenshots:all
```

### Capture Desktop Screenshots Only (1440 x 1000)

```bash
npm run screenshots:desktop
```

### Capture Mobile Screenshots Only (390 x 844)

```bash
npm run screenshots:mobile
```

### Override Target URL via CLI

```bash
node playwright/capture-screenshots.js --all --url=http://localhost:4200
```

---

## 7. Screenshot Output Directory Structure

Generated screenshots and reports are stored under `screenshots/`:

```text
screenshots/
├── desktop/
│   ├── public/
│   │   ├── home.png
│   │   ├── slider.png
│   │   ├── contact.png
│   │   ├── about.png
│   │   ├── furniture.png
│   │   ├── product-detail.png
│   │   ├── login.png
│   │   ├── register.png
│   │   ├── verify-otp.png
│   │   ├── forgot-password.png
│   │   └── forbidden.png
│   │
│   ├── user/
│   │   ├── cart.png
│   │   ├── dashboard.png
│   │   ├── profile.png
│   │   ├── update-user.png
│   │   ├── checkout.png
│   │   ├── my-orders.png
│   │   └── order-confirmation.png
│   │
│   └── admin/
│       ├── dashboard.png
│       ├── products.png
│       ├── users.png
│       ├── add-product.png
│       ├── product-details.png
│       ├── orders.png
│       ├── order-visualization.png
│       └── edit-product.png
│
├── mobile/
│   ├── public/
│   ├── user/
│   └── admin/
│
├── errors/              # Diagnostic screenshots for any failed routes/logins
├── manifest.json        # Machine-readable route-to-screenshot mapping
└── report.json          # Execution statistics and detailed logs
```

---

## 8. Customizing Viewport Dimensions

To adjust viewport sizes, edit `VIEWPORTS` in `playwright/capture-screenshots.js`:

```javascript
const VIEWPORTS = {
  desktop: { name: 'desktop', width: 1440, height: 1000 },
  mobile: { name: 'mobile', width: 390, height: 844 }
};
```

---

## 9. Customizing Route Inventory

To add or modify target routes, edit `playwright/config/routes.js`:

```javascript
{
  name: 'custom-page',
  path: '/custom-path',
  access: 'public', // 'public', 'user', or 'admin'
  role: null,
  screenshotFilename: 'custom-page.png',
  notes: 'Description of custom page'
}
```

---

## 10. Troubleshooting & Error Diagnostics

- **Missing Screenshots or Failed Captures**: Check `screenshots/report.json` for exact failure messages. Diagnostic screenshots of broken pages are saved in `screenshots/errors/`.
- **Backend API Down**: Public routes will render standard static pages. Authenticated pages will use state fallback or display angular error states as designed.
- **Port Conflict**: If Angular runs on a port other than 4200, pass `--url=http://localhost:<PORT>` or update `BUYFURN_BASE_URL` in `.env`.
