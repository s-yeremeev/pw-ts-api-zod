import { test as setup } from '@playwright/test'
import { LoginPage } from '@pages/login-page'
import { STORAGE_STATE, credentials, type Role } from '@tests/e2e/ui-fixtures'

/**
 * `setup` project: authenticate each role once and persist its storage state.
 * e2e/sequential projects depend on it (see playwright.config.ts).
 */
for (const role of Object.keys(credentials) as Role[]) {
  setup(`authenticate as ${role}`, async ({ page }) => {
    const loginPage = new LoginPage(page)
    const { username, password } = credentials[role]
    await loginPage.login(username, password)
    await page.context().storageState({ path: STORAGE_STATE[role] })
  })
}
