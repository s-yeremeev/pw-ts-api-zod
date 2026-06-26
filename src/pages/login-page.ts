import { expect, Locator, Page } from '@playwright/test'
import { UniversalPage } from '@pages/universal-page'

/** Example feature page. Adapt selectors to your app under test. */
export class LoginPage extends UniversalPage {
  private readonly username: Locator
  private readonly password: Locator
  private readonly loginButton: Locator

  constructor(page: Page) {
    super(page)
    this.username = page.locator('[data-test="username"]')
    this.password = page.locator('[data-test="password"]')
    this.loginButton = page.locator('[data-test="login-button"]')
  }

  async login(email: string, password: string): Promise<void> {
    await this.open(process.env.BASE_URL)
    await this.username.fill(email)
    await this.password.fill(password)
    await this.loginButton.click()
    await this.waitForPageReady()
    await expect(this.page.locator('[data-test="item-4-title-link"] [data-test="inventory-item-name"]')).toMatchAriaSnapshot(`- text: Sauce Labs Backpack`)
    await expect(this.page.locator('[data-test="inventory-list"]')).toContainText(
      'carry.allTheThings() with the sleek, streamlined Sly Pack that melds uncompromising style with unequaled laptop and tablet protection.',
    )
  }
}
