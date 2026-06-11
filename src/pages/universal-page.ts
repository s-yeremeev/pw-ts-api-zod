import { Page, Locator } from '@playwright/test'

/**
 * Base page object. Every feature page extends this.
 * Locators go through helper methods here — never raw `page.locator()` in tests.
 */
export class UniversalPage {
  constructor(protected readonly page: Page) {}

  /** Navigate to a path relative to BASE_URL. */
  async open(path = '/'): Promise<void> {
    await this.page.goto(path)
  }

  byRole(role: Parameters<Page['getByRole']>[0], name: string | RegExp): Locator {
    return this.page.getByRole(role, { name })
  }

  byLabel(label: string | RegExp): Locator {
    return this.page.getByLabel(label)
  }

  byTestId(testId: string): Locator {
    return this.page.getByTestId(testId)
  }

  /** Domain-level wait. Replace with project-specific readiness (ajax/spinner) when known. */
  async waitForPageReady(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded')
  }
}
