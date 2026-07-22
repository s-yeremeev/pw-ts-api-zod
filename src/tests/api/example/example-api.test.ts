import { test, expect } from '@tests/base-test'
import { AuthorizeRequest, RefreshTokenRequest } from '@rest/auth/auth.utils'
import { createActivityRequest, credentials } from './example-api.data'
import { assertResponseBody } from '@rest/utils/json-validator'

test.describe('api: auth', () => {
  test('t_01_refresh_endpoint_returns_new_access_token', async ({ authApi }) => {
    const tokenResponse = await authApi.token(new AuthorizeRequest(credentials.username, credentials.password))
    const refreshToken = tokenResponse.body.data.authToken.refreshToken ?? ''

    const response = await authApi.refresh(new RefreshTokenRequest(refreshToken))
    expect(response.status).toBe(200)
    expect(response.body.data.authToken.accessToken).toBeTruthy()
    expect(response.body.data.authToken.login).toBe(credentials.username)
    expect(response.body.data.authToken.accessTokenExpiresIn).toBe(credentials.accessTokenExpiresIn)
  })

  test('t_02_get_activities_returns_list', async ({ activitiesApi }) => {
    const response = await activitiesApi.getActivities()
    expect(response.body).toBeInstanceOf(Array)
    expect(response.body.length).toBeGreaterThan(0)
    expect(response.body[0].id).toBeTruthy()
    expect(response.body[0].title).toBeTruthy()
    expect(typeof response.body[0].completed).toBe('boolean')
    assertResponseBody(response.body, 'get-activities.json', ['dueDate'])
  })

  test('t_03_create_activity', async ({ activitiesApi }) => {
    const response = await activitiesApi.createActivity(createActivityRequest)
    expect(response.body.id).toBe(createActivityRequest.id)
    expect(response.body.title).toBe(createActivityRequest.title)
    expect(response.body.completed).toBe(createActivityRequest.completed)
  })
})
