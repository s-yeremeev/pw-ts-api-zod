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
    expect(response.status).toBe(201)
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
