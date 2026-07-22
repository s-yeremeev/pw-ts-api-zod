import { test as base, ConsoleMessage } from '@playwright/test'
import { LoginPage } from '@pages/login-page'
import path from 'node:path'

/** Roles that have their own persisted login state. */
export type Role = 'user' | 'admin'

/** Credentials per role (values come from .env — never inline in specs). */
export const credentials: Record<Role, { username: string; password: string }> = {
  user: { username: process.env.TEST_USER ?? '', password: process.env.TEST_PASSWORD ?? '' },
  admin: { username: process.env.ADMIN_USER ?? '', password: process.env.ADMIN_PASSWORD ?? '' },
}

/** Persisted auth-state file per role (written by the `setup` project). */
export const STORAGE_STATE: Record<Role, string> = {
  user: path.join('.auth', 'user.json'),
  admin: path.join('.auth', 'admin.json'),
}

export interface UiFixtures {
  loginPage: LoginPage
}

export interface UiOptions {
  /** Which saved login state to use. Override per spec: `test.use({ role: 'admin' })`. */
  role: Role
}

/** UI-layer fixtures (page objects via dependency injection). */
export const uiTest = base.extend<UiFixtures & UiOptions>({
  page: async ({ page }, use) => {
    page.on('console', async (message: ConsoleMessage) => {
      if (message.type() === 'error') {
        throw new Error(`Console error: ${message.text()}`)
      }
    })
    await use(page)
    //add clean uo if you need
  },

  // Variant B — declarative role selection. Default 'user' applies everywhere unless overridden.
  role: ['user', { option: true }],
  // Resolve the persisted session from the selected role.
  // Variant A still works: `test.use({ storageState: STORAGE_STATE.admin })` overrides this directly.
  storageState: async ({ role }, use) => {
    await use(STORAGE_STATE[role])
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page))
  },
})
