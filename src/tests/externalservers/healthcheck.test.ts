import { test, expect } from '@tests/base-test'

/**
 * Production / external health checks.
 * Run via: pnpm run test --project=healthcheck  (matches the @healthcheck tag)
 */
test('@healthcheck home page is reachable', async ({ page }) => {
  const response = await page.goto('/')
  expect(response?.ok()).toBeTruthy()
})
