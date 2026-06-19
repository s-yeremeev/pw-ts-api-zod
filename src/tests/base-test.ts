import { mergeTests } from '@playwright/test'
import { uiTest } from '@tests/e2e/ui-fixtures'
import { apiTest } from '@tests/api/api-fixtures'
import path from 'node:path'
export { expect } from '@playwright/test'

/**
 * Single entry point for tests: merges UI + API fixtures.
 * Import `test` and `expect` from here in every spec.
 */
export const test = mergeTests(uiTest, apiTest)

export const STORAGE_STATE = path.join('.auth', 'user.json')
