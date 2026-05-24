import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir:         './e2e',
  fullyParallel:   true,
  forbidOnly:      !!process.env.CI,
  retries:         process.env.CI ? 2 : 0,
  workers:         process.env.CI ? 1 : undefined,
  reporter:        [['html', { open: 'never' }], ['line']],
  use: {
    baseURL:       'http://localhost:5173',
    trace:         'on-first-retry',
    screenshot:    'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command:       'pnpm dev',
    url:           'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout:       120_000,
    env: {
      VITE_API_URL:              'http://localhost:8000',
      VITE_FIREBASE_API_KEY:     'test',
      VITE_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
      VITE_FIREBASE_PROJECT_ID:  'test-project',
    },
  },
})
