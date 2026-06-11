import { test, expect } from '@tests/base-test'
import { AuthorizeRequest, RefreshTokenRequest } from '@rest/auth/auth.utils'
import { companyData, credentials } from './auth.data'

test.describe('api: auth', () => {
  test('t_01_refresh_endpoint_returns_new_access_token', async ({ authApi }) => {
    const tokenResponse = await authApi.token(new AuthorizeRequest(credentials.username, credentials.password))
    const refreshToken = tokenResponse.body?.data.authToken.refreshToken ?? ''

    const response = await authApi.refresh(new RefreshTokenRequest(refreshToken))
    expect(response.status).toBe(200)
    expect(response.body?.data.authToken.accessToken).toBeTruthy()
    expect(response.body?.data.authToken.login).toBe(credentials.username)
    expect(response.body?.data.authToken.accessTokenExpiresIn).toBe(credentials.accessTokenExpiresIn)
  })

  test('t_02_get_company_returns_company_data', async ({ authApi, companiesApi }) => {
    const tokenResponse = await authApi.token(new AuthorizeRequest(credentials.username, credentials.password))
    const token = tokenResponse.body?.data.authToken.accessToken ?? ''

    const response = await companiesApi.getCompany(companyData.id, token)
    expect(response.body?.data.id).toBe(companyData.id)
    expect(response.body?.data.name).toBe(companyData.name)
  })
})
