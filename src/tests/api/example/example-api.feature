Feature: API layer — auth + activities

  Background:
    All API classes extend ApiClient.
    Requests are built with RequestOptionsBuilder and dispatched through ApiClient.send().
    Responses are validated against Zod schemas and returned as IApiResponse<T>.
    Dependencies are injected via Playwright fixtures (api-fixtures.ts).

  # ── t_01 ─────────────────────────────────────────────────────────────────

  Scenario: t_01 — Refresh endpoint returns a new access token
    Given valid credentials (username, password) defined in example-api.data.ts
    When  POST /api/v2/auth/token is called with AuthorizeRequest(username, password)
    And   the refreshToken from that response is passed to POST /api/v2/auth/refresh as RefreshTokenRequest
    Then  the response status is 200
    And   response.body.data.authToken.accessToken is truthy
    And   response.body.data.authToken.login equals credentials.username
    And   response.body.data.authToken.accessTokenExpiresIn equals credentials.accessTokenExpiresIn (1440)

  Request flow:
    example-api.data.ts   →  credentials { username, password, accessTokenExpiresIn }
    auth.utils.ts         →  AuthorizeRequest(username, password)
                             RefreshTokenRequest(refreshToken)
    auth.api.ts           →  AuthApi.token()   — POST /api/v2/auth/token
                             AuthApi.refresh() — POST /api/v2/auth/refresh
                              both use RequestOptionsBuilder:
                                .request(body)
                                .responseType(AccessTokenResponseSchema)
                                .expectedStatusCode(200)
                                .build()
    api-client.ts         →  ApiClient.send<T>()
                              - prepends API_BASE_URL to the path
                              - sets default headers: Accept-Language, Content-Type
                              - calls Playwright APIRequestContext.fetch()
                              - asserts HTTP status code
                              - parses JSON with the Zod schema
                              - returns IApiResponse<T> { status, body }
    auth.model.ts         →  AccessTokenResponseSchema (Zod) + AccessTokenResponse (TS type)
    api-fixtures.ts       →  authApi: AuthApi(request, apiBaseUrl)

  # ── t_02 ─────────────────────────────────────────────────────────────────

  Scenario: t_02 — GET /api/v1/Activities returns a non-empty list matching the snapshot
    When  GET /api/v1/Activities is called (no request body)
    Then  response.body is a non-empty array
    And   each item has a truthy id and title, and a boolean completed field
    And   response.body matches the JSON snapshot upload-files/get-activities.json
          with the "dueDate" field ignored (dynamic timestamp)

  Snapshot behaviour:
    TEACH_MODE=true  →  assertResponseBody() writes response.body to disk (baseline capture)
    TEACH_MODE unset →  assertResponseBody() reads the file and calls expect().toStrictEqual()
                        fields listed in ignoreFields are stripped from both sides before comparison

  Request flow:
    activities.api.ts     →  ActivitiesApi.getActivities() — GET /api/v1/Activities
                              RequestOptionsBuilder:
                                .responseType(ActivitiesResponseSchema)
                                .expectedStatusCode(200)
                                .build()
    activities.model.ts   →  ActivitySchema (z.strictObject) + ActivitiesResponseSchema (z.array)
    json-validator.ts     →  assertResponseBody(actual, filename, ignoreFields)
    omit-fields.ts        →  omitFields() — recursive field removal before deep-equal comparison
    api-fixtures.ts       →  activitiesApi: ActivitiesApi(request, apiBaseUrl)
