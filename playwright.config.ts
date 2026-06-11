import * as dotenv from 'dotenv'
import { defineConfig } from '@playwright/test'
import path from 'node:path'

dotenv.config()
// Optional secret files — uncomment when integrations are used:
// dotenv.config({ path: './external-credentials.env' })
// dotenv.config({ path: './email-passwords.env' })

const reports = path.join(process.cwd(), 'reports')

export default defineConfig({
  testDir: process.env.TEST_DIR || 'src/tests',
  timeout: Number(process.env.TIMEOUT ?? 120_000),
  retries: Number(process.env.RETRIES ?? 2),
  fullyParallel: process.env.FULLY_PARALLEL === 'true',
  workers: Number(process.env.WORKERS ?? 4),
  maxFailures: Number(process.env.MAX_FAILURES ?? 500),
  snapshotPathTemplate: '{testDir}/{testFileDir}/snapshots/{arg}{ext}',
  reporter: [
    ['list'],
    ['html', { outputFolder: reports + '/html-report', open: 'never' }],
    ['junit', { outputFile: reports + '/junit-report.xml', embedAnnotationsAsProperties: true }],
  ],
  expect: { timeout: Number(process.env.TIMEOUT_VISIBLE_LOCATOR ?? 60_000) },
  use: {
    baseURL: process.env.BASE_URL,
    actionTimeout: Number(process.env.ACTION_TIMEOUT ?? 60_000),
    headless: process.env.HEADLESS === 'true',
    ignoreHTTPSErrors: process.env.IGNOREHTTPSERRORS === 'true',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: 'auth-storage-state.setup.ts' },
    {
      name: 'e2e',
      testDir: 'src/tests/e2e',
      retries: 1,
      use: { headless: true },
      grepInvert: /@sequential/,
      dependencies: ['setup'],
    },
    {
      name: 'sequential',
      testDir: 'src/tests/e2e',
      grep: /@sequential/,
      workers: 1,
      fullyParallel: false,
      retries: 1,
      use: { headless: true },
      dependencies: ['setup'],
    },
    { name: 'api', testDir: 'src/tests/api', use: { trace: 'off', baseURL: process.env['API_BASE_URL'] ?? process.env['BASE_URL'] } },
    { name: 'healthcheck', grep: /@healthcheck/ },
    { name: 'externalservers', testDir: 'src/tests/externalservers', use: { headless: true } },
  ],
})
