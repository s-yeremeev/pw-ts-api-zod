import { test, expect } from '@tests/base-test'
import { loginCases } from './example.data'

/**
 * Example E2E spec. Naming: t_NN_snake_case for test titles.
 * Tag @sequential for tests that must run single-worker.
 */
test.describe('login', () => {
  for (const data of loginCases) {
    test(`t_01_${data.title}`, async ({ loginPage, page }) => {
      await loginPage.login(data.email, data.password)
      await expect(page).toHaveURL(data.expectedUrl)
    })
  }
})
