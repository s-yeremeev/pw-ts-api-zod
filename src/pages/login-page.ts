import { Page } from '@playwright/test'
import { UniversalPage } from '@pages/universal-page'

/** Example feature page. Adapt selectors to your app under test. */
export class LoginPage extends UniversalPage {
  constructor(page: Page) {
    super(page)
  }

  private emailInput() {
    return this.byLabel(/email/i)
  }

  private passwordInput() {
    return this.byLabel(/password/i)
  }

  private submitButton() {
    return this.byRole('button', /log in/i)
  }

  async login(email: string, password: string): Promise<void> {
    await this.open('/login')
    await this.emailInput().fill(email)
    await this.passwordInput().fill(password)
    await this.submitButton().click()
    await this.waitForPageReady()
  }
}
