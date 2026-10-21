import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end specs against the real app and the project in .env.local (#161).
 * Run on demand with `npm run test:e2e`; `npm test` (vitest) never picks them up.
 */
export default defineConfig({
  testDir: './e2e',
  // One room at a time: the specs create real rows in the live project.
  fullyParallel: false,
  workers: 1,
  // A QUIZ question runs 30 s after the 8 s ad break.
  timeout: 120_000,
  expect: { timeout: 15_000 },
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5173 --strictPort',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: true,
  },
});
