import { Locator, Page } from '@playwright/test'
import { UniversalPage } from '@pages/universal-page'

/** Example feature page. Adapt selectors to your app under test. */
export class LoginPage extends UniversalPage {
  private readonly username: Locator
  private readonly password: Locator
  private readonly loginButton: Locator
  private readonly cookiesButton: Locator

  constructor(page: Page) {
    super(page)
    this.username = page.locator('input[name="loginInput"]')
    this.password = page.locator('input[name="pswd"]')
    this.loginButton = page.getByRole('link', { name: 'Einloggen' })
    this.cookiesButton = page.getByRole('button', { name: 'Cookies akzeptieren' })
  }

  async login(email: string, password: string): Promise<void> {
    await this.open('/portal/portals/allgemein/index.jsp')
    await this.cookiesButton.click()
    await this.username.fill(email)
    await this.password.fill(password)
    await this.loginButton.click()
    await this.waitForPageReady()
  }
}
