import { test as base } from '@playwright/test'
import { ApiClient } from '@rest/api-client'
import { AuthApi } from '@rest/auth/auth.api'
import { CompaniesApi } from '@rest/companies/companies.api'

export interface ApiFixtures {
  apiClient: ApiClient
  authApi: AuthApi
  companiesApi: CompaniesApi
}

const apiBaseUrl = process.env['API_BASE_URL'] ?? ''

/** API-layer fixtures. */
export const apiTest = base.extend<ApiFixtures>({
  apiClient: async ({ request }, use) => {
    await use(new ApiClient(request, apiBaseUrl))
  },
  authApi: async ({ request }, use) => {
    await use(new AuthApi(request, apiBaseUrl))
  },
  companiesApi: async ({ request }, use) => {
    await use(new CompaniesApi(request, apiBaseUrl))
  },
})
