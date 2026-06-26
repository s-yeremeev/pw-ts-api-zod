import { test, STORAGE_STATE } from '@tests/base-test'

/**
 * Two ways to pick which saved login state a test uses.
 * They can coexist — keep whichever fits the project and delete the other.
 */

// explicit storageState file via test.use
test.describe('admin area — variant A (explicit storageState)', () => {
  test.use({ storageState: STORAGE_STATE.admin })

  test('t_01_runs_as_admin', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/inventory.html')
  })
})

// No override → default role 'user' (see ui-fixtures.ts).
test('t_01_runs_as_default_user', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/inventory.html')
})
