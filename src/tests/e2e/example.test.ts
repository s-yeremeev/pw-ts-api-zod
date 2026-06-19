import { test, expect, STORAGE_STATE } from '@tests/base-test'
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

test.describe('testing', () => {
  // Reuse the authenticated session persisted by the `setup` project.
  test.use({ storageState: STORAGE_STATE })

  test(`t_01_ddd`, async ({ page }) => {
    await expect(page).toHaveURL('http')
  })
})
