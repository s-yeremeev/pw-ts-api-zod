import { test as base } from '@playwright/test'
import { LoginPage } from '@pages/login-page'

export interface UiFixtures {
  loginPage: LoginPage
}

/** UI-layer fixtures (page objects via dependency injection). */
export const uiTest = base.extend<UiFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page))
  },
})
