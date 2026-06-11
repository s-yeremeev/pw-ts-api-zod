Feature: Authentication API

  Background:
    The API client is injected via fixture (AuthApi extends ApiClient).
    Requests are built with RequestOptionsBuilder and dispatched through ApiClient.send().
    Responses are validated against Zod schemas and returned as IApiResponse<T>.

  Scenario: Obtain an access token and refresh it
    Given valid user credentials (username, password) defined in auth.data.ts
    When  POST /api/v2/auth/token is called with an AuthorizeRequest body
    Then  the response status is 200
    And   response.body.data.authToken.accessToken is truthy
    And   response.body.data.authToken.refreshToken is truthy

    When  the received refreshToken is passed to POST /api/v2/auth/refresh as a RefreshTokenRequest body
    Then  the response status is 200
    And   response.body.data.authToken.accessToken is truthy
    And   response.body.data.authToken.login matches the original username
    And   response.body.data.authToken.accessTokenExpiresIn matches the expected value

  Request flow (layer by layer):
    auth.data.ts          →  string credentials (username, password, accessTokenExpiresIn)
    auth.utils.ts         →  AuthorizeRequest / RefreshTokenRequest  (plain request body classes)
    auth.api.ts           →  AuthApi.token() / AuthApi.refresh()
                              builds ApiRequestOptions via RequestOptionsBuilder:
                                .request(body)
                                .responseType(AccessTokenResponseSchema)
                                .expectedStatusCode(200)
                                .build()
    api-client.ts         →  ApiClient.send<T>()
                              - prepends API base URL to the path
                              - sets default headers: Accept-Language, Content-Type
                              - calls Playwright APIRequestContext.fetch()
                              - asserts HTTP status code
                              - parses JSON response body with the Zod schema
                              - returns IApiResponse<T> { status, body }
    auth.model.ts         →  AccessTokenResponseSchema (Zod) + AccessTokenResponse (TypeScript type)
    api-fixtures.ts       →  injects AuthApi(request, apiBaseUrl) into every test via Playwright fixtures
