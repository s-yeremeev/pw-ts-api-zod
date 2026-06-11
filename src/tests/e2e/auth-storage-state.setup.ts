import { test as setup } from '@playwright/test'
import { LoginPage } from '@pages/login-page'
import path from 'node:path'

export const STORAGE_STATE = path.join('.auth', 'user.json')

/**
 * `setup` project: authenticate once and persist storage state.
 * e2e/sequential projects depend on it (see playwright.config.ts).
 */
setup('authenticate', async ({ page }) => {
  const loginPage = new LoginPage(page)
  await loginPage.login(process.env.TEST_USER ?? '', process.env.TEST_PASSWORD ?? '')
  await page.context().storageState({ path: STORAGE_STATE })
})
