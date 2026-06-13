---
name: generate-api-endpoint
description: Generate all boilerplate for a new API endpoint following the project's REST layer conventions — Zod model, request body class, ApiClient service method, fixture registration, and a test example. Use when the user wants to add or scaffold an API endpoint, generate an endpoint from a cURL command, or create a model from Swagger.
---

# Skill: generate-api-endpoint

## Purpose

Generate all boilerplate for a new API endpoint following the project's REST layer conventions.
The skill collects two inputs from the user, then produces four artifacts (model, utils, api method, test example) that mirror the existing `auth` domain structure.

---

## Trigger phrases

- "add API endpoint"
- "generate endpoint from curl"
- "scaffold API method"
- "create model from swagger"

---

## Step 0 — Verify (or bootstrap) the REST layer

**Run this before collecting any input.** Do not ask the user anything yet.

The endpoint generator assumes the shared REST transport layer already exists. Check for these files **in this exact order** and stop at the first decision:

| File | Role |
| --- | --- |
| `src/rest/enum/http-method.ts` | `EHttpMethod` enum |
| `src/rest/api-response.ts` | `IApiResponse<T>` interface |
| `src/rest/request-options.ts` | `ApiRequestOptions` + `RequestOptionsBuilder` |
| `src/rest/api-client.ts` | `ApiClient` base class with `send<T>()` |
| `src/tests/api/api-fixtures.ts` | `apiTest` fixture with `apiClient` |
| `src/rest/utils/omit-fields.ts` | recursive field stripper (used by the snapshot helper) |
| `src/rest/utils/json-validator.ts` | `assertResponseBody` — JSON snapshot assertion with `TEACH_MODE` |

Decision:

- **All five exist** → the REST layer is present. Print one line (`✓ REST layer present`) and proceed to Step 1.
- **One or more are missing** → bootstrap the missing files first (create only the ones that are absent — never overwrite an existing file), then proceed to Step 1.

> Rationale: without this layer, every generated `*.api.ts` would reference `ApiClient` / `RequestOptionsBuilder` / `EHttpMethod` that don't exist, and the endpoint would not compile.

### Bootstrap templates

Create each **missing** file with exactly this content.

`src/rest/enum/http-method.ts`:

```ts
export enum EHttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}
```

`src/rest/api-response.ts`:

```ts
export interface IApiResponse<T> {
  status: number
  body: T | null
}
```

`src/rest/request-options.ts`:

```ts
import { ZodSchema } from 'zod'
import { EHttpMethod } from './enum/http-method'

export interface ApiRequestOptions {
  method: EHttpMethod
  url: string
  request?: unknown
  responseType?: ZodSchema
  headers?: Record<string, string>
  expectedStatusCode?: number
}

export class RequestOptionsBuilder {
  private readonly options: Partial<ApiRequestOptions> = {}

  constructor(
    private readonly method: EHttpMethod,
    private readonly url: string,
  ) {
    this.options.method = method
    this.options.url = url
  }

  request(request: unknown): this {
    this.options.request = request
    return this
  }

  responseType(responseType: ZodSchema): this {
    this.options.responseType = responseType
    return this
  }

  headers(headers: Record<string, string>): this {
    this.options.headers = headers
    return this
  }

  expectedStatusCode(status: number): this {
    this.options.expectedStatusCode = status
    return this
  }

  build(): ApiRequestOptions {
    return {
      method: this.method,
      url: this.url,
      ...this.options,
    } as ApiRequestOptions
  }
}
```

`src/rest/api-client.ts`:

```ts
import { APIRequestContext } from '@playwright/test'
import { IApiResponse } from './api-response'
import { ApiRequestOptions } from './request-options'

export class ApiClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly baseUrl = '',
  ) {}

  async send<T>(options: ApiRequestOptions): Promise<IApiResponse<T>> {
    const url = `${this.baseUrl}${options.url}`

    const defaultHeaders: Record<string, string> = {
      'Accept-Language': 'de',
      'Content-Type': 'application/json',
    }

    const response = await this.request.fetch(url, {
      method: options.method,
      headers: { ...defaultHeaders, ...options.headers },
      data: options.request ? JSON.stringify(options.request) : undefined,
    })

    if (options.expectedStatusCode !== undefined && response.status() !== options.expectedStatusCode) {
      throw new Error(`Expected status ${options.expectedStatusCode} but got ${response.status()} for ${options.method} ${url}`)
    }

    const contentType = response.headers()['content-type'] ?? ''
    let body: T | null = null

    if (contentType.includes('application/json')) {
      const json = await response.json()
      body = options.responseType ? (options.responseType.parse(json) as T) : (json as T)
    }

    return { status: response.status(), body }
  }
}
```

`src/tests/api/api-fixtures.ts` (only the base shell — add per-domain API fixtures later per Step 4):

```ts
import { test as base } from '@playwright/test'
import { ApiClient } from '@rest/api-client'

export interface ApiFixtures {
  apiClient: ApiClient
}

const apiBaseUrl = process.env['API_BASE_URL'] ?? ''

/** API-layer fixtures. */
export const apiTest = base.extend<ApiFixtures>({
  apiClient: async ({ request }, use) => {
    await use(new ApiClient(request, apiBaseUrl))
  },
})
```

`src/rest/utils/omit-fields.ts`:

```ts
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Recursively omits specified fields from an object or array.
 * @param object - The object or array to process
 * @param fieldsToOmit - Array of field names to omit
 * @returns New object/array with specified fields removed
 */
export function omitFields(object: any, fieldsToOmit: string[]): any {
  if (Array.isArray(object)) return object.map((item) => omitFields(item, fieldsToOmit))

  if (typeof object !== 'object' || object === null) return object

  const result: any = {}
  for (const key of Object.keys(object)) {
    if (fieldsToOmit.includes(key)) continue
    result[key] = omitFields(object[key], fieldsToOmit)
  }
  return result
}
```

`src/rest/utils/json-validator.ts` (snapshot assertion helper — depends on `omit-fields.ts`, so create both together):

```ts
import fs from 'node:fs'
import path from 'node:path'
import test, { expect } from '@playwright/test'
import { omitFields } from './omit-fields'

/**
 * Asserts that `actualResponse` matches a saved JSON snapshot.
 *
 * Expected JSON files live in an `upload-files/` folder next to the spec:
 *   <spec-dir>/upload-files/<filename>
 *
 * TEACH_MODE:
 *   Set `TEACH_MODE=true` to write the actual response to disk instead of asserting —
 *   this lets you capture a baseline snapshot on the first run.
 *   Example: TEACH_MODE=true pnpm test -- <path>
 *
 * @param actualResponse - The parsed response body to assert
 * @param filename       - JSON file name inside the `upload-files/` folder (e.g. `get-activities.json`)
 * @param ignoreFields   - Optional list of field names to strip before comparison (e.g. dynamic timestamps)
 */
export function assertResponseBody(actualResponse: unknown, filename: string, ignoreFields: string[] = []): void {
  const uploadFilePath = path.join(path.dirname(test.info().file), 'upload-files', filename)

  if (process.env['TEACH_MODE'] === 'true') {
    fs.mkdirSync(path.dirname(uploadFilePath), { recursive: true })
    fs.writeFileSync(uploadFilePath, JSON.stringify(actualResponse, null, 2), 'utf8')
  } else {
    if (!fs.existsSync(uploadFilePath)) {
      throw new Error(`Snapshot file not found: ${uploadFilePath}\nRun with TEACH_MODE=true to create it.`)
    }

    const expected: unknown = JSON.parse(fs.readFileSync(uploadFilePath, 'utf8'))

    if (ignoreFields.length > 0) {
      const cleanedActual = omitFields(actualResponse, ignoreFields)
      const cleanedExpected = omitFields(expected, ignoreFields)
      expect(cleanedActual, `Response does not match snapshot: ${filename}`).toStrictEqual(cleanedExpected)
    } else {
      expect(actualResponse, `Response does not match snapshot: ${filename}`).toStrictEqual(expected)
    }
  }
}
```

> The snapshot helper is **optional** — the four core transport files are enough for an endpoint to compile. Bootstrap `omit-fields.ts` + `json-validator.ts` only when the user wants snapshot-based response assertions (`assertResponseBody`) instead of, or in addition to, inline `expect` checks. When present, you can reference it in the Step 5 test snippet as an alternative assertion style.

After bootstrapping, also confirm that:

- The `@rest/*` path alias resolves to `src/rest/*` (in `tsconfig.json`). If it does not, note this to the user instead of editing `tsconfig.json` silently.
- `zod` is a dependency. If missing, tell the user to run `pnpm add zod` — do not install it yourself.

---

## Input collection (ask in this exact order)

### Step 1 — cURL from Swagger

Ask the user:

> Paste the cURL command for this endpoint from Swagger UI.

Parse from the cURL:

- **HTTP method** — `-X 'POST'` → `EHttpMethod.POST`
- **Path** — extract everything after the host, e.g. `/api/v2/persons`
- **Request body** — content of `-d '{ ... }'`, if present
- **Headers** — any `-H` entries (skip `accept`, `Content-Type`; note `Accept-Language` value)

### Step 2 — Response body

Ask the user:

> Paste the example response body (JSON). If there is no response body (e.g. 204 No Content), type `none`.

---

## Generation rules

### 1. Zod model — `src/rest/model/<domain>.model.ts`

- Add a JSDoc block above each schema describing the endpoint:
  ```
  /**
   * <METHOD> <path>
   * <one-line description from swagger operationId / summary>
   *
   * Request body: <RequestClassName>
   *   - <field> (<required|optional>): <description>
   *
   * Response <status>: <ResponseTypeName>
   *   - <field path> – <description>
   */
  ```
- Map JSON types to Zod:
  | JSON | Zod |
  |---|---|
  | `string` | `z.string()` |
  | `number` / `integer` | `z.number()` |
  | `boolean` | `z.boolean()` |
  | `array` | `z.array(...)` |
  | `object` | `z.strictObject({...})` |
  | nullable / optional | `.nullable()` / `.optional()` |
- Always use `z.strictObject` instead of `z.object` for all object schemas — this rejects unknown keys and catches API contract drift early.
- Required request fields → no `.optional()`. Optional fields → `.optional()`.
- Export both the schema constant (`XxxSchema`) and the inferred type (`type Xxx = z.infer<typeof XxxSchema>`).
- If the response body is `none`, do not create a response schema.

### 2. Request body class — `src/rest/<domain>/<domain>.utils.ts`

- One class per distinct request body shape.
- Constructor parameters match required fields first, then optional (with `?`).
- Example pattern (from `auth.utils.ts`):
  ```ts
  export class CreatePersonRequest {
    constructor(
      public readonly firstName: string,
      public readonly lastName: string,
      public readonly companyId?: number,
    ) {}
  }
  ```

### 3. API service method — `src/rest/<domain>/<domain>.api.ts`

- Class extends `ApiClient`.
- One method per endpoint, named after the HTTP verb + resource noun (camelCase).
- Use `RequestOptionsBuilder`:
  ```ts
  async createPerson(requestBody: CreatePersonRequest): Promise<IApiResponse<CreatePersonResponse>> {
    return this.send<CreatePersonResponse>(
      new RequestOptionsBuilder(EHttpMethod.POST, '/api/v2/persons')
        .request(requestBody)
        .responseType(CreatePersonResponseSchema)
        .expectedStatusCode(201)
        .build(),
    )
  }
  ```
- If no response body → omit `.responseType(...)`, return `IApiResponse<null>`.
- If `Accept-Language` header is required → add `.headers({ 'Accept-Language': 'en' })`.

### 4. Fixture registration

Check whether `src/tests/api/api-fixtures.ts` already imports this API class.

- **If the API class is new** — automatically edit `src/tests/api/api-fixtures.ts`:
  1. Add the import at the top.
  2. Add the property to the `ApiFixtures` interface.
  3. Add the fixture implementation inside `apiTest.extend<ApiFixtures>({...})`.

```ts
// import
import { PersonApi } from '@rest/persons/persons.api'

// interface
personApi: PersonApi

// fixture
personApi: async ({ request }, use) => {
  await use(new PersonApi(request, apiBaseUrl))
},
```

- **If the API class already exists** — only add the new method to the existing class, do not touch the fixture file.

### 5. Test example — show, do not create file

Print a ready-to-copy test snippet that follows `auth.test.ts` conventions:

- Import `test`, `expect` from `@tests/base-test`
- Import the request body class from `@rest/<domain>/<domain>.utils`
- Import test data from `./<domain>.data`
- Test name: `t_01_<verb>_<resource>_returns_<expected_outcome>`
- Assertions on `response.status` and `response.body`

```ts
import { test, expect } from '@tests/base-test'
import { CreatePersonRequest } from '@rest/persons/persons.utils'
import { personData } from './persons.data'

test.describe('api: persons', () => {
  test('t_01_create_person_returns_201', async ({ personApi }) => {
    const response = await personApi.createPerson(new CreatePersonRequest(personData.firstName, personData.lastName))
    expect(response.body?.data.id).toBeTruthy()
  })
})
```

---

## Output checklist

After generating, confirm each item:

- [ ] Zod schema + TS type added to `src/rest/model/<domain>.model.ts`
- [ ] Request body class added to `src/rest/<domain>/<domain>.utils.ts`
- [ ] Service method added to `src/rest/<domain>/<domain>.api.ts`
- [ ] Fixture reminder shown
- [ ] Test snippet shown
- [ ] `pnpm run typecheck` passes (ask user to confirm)

---

## Conventions to follow

- `required` fields in Zod → no `.optional()`; optional fields → `.optional()`
- Request body classes live in `src/rest/<domain>/<domain>.utils.ts`, never in the model file
- Zod schemas live in `src/rest/model/<domain>.model.ts`, never in the service class
- Service classes extend `ApiClient` directly — do **not** wrap `ApiClient` as a constructor argument
- Test data (string/number literals) live in `<test-name>.data.ts` next to the spec
- Never inline credentials or environment variables in test files
- Never use `process.env` or `requireEnvironment` in `*.data.ts` — use plain literals for test data
