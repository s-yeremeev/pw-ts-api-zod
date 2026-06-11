import { mergeTests } from '@playwright/test'
import { uiTest } from '@tests/e2e/ui-fixtures'
import { apiTest } from '@tests/api/api-fixtures'
export { expect } from '@playwright/test'

/**
 * Single entry point for tests: merges UI + API fixtures.
 * Import `test` and `expect` from here in every spec.
 */
export const test = mergeTests(uiTest, apiTest)
