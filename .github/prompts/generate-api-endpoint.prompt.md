---
mode: agent
description: Generate all boilerplate for a new API endpoint (model, utils, api method, test snippet) from a Swagger cURL + response body.
---

Generate all boilerplate for a new API endpoint following this project's REST layer conventions.

## Step 1 — ask for cURL

Ask the user:

> Paste the cURL command for this endpoint from Swagger UI.

Parse from the cURL:

- **HTTP method** — `-X 'POST'` → `EHttpMethod.POST`
- **Path** — everything after the host, e.g. `/api/v2/persons`
- **Request body** — content of `-d '{ ... }'`, if present
- **Headers** — any `-H` entries (ignore `accept` and `Content-Type`; note `Accept-Language` value)

## Step 2 — ask for response body

Ask the user:

> Paste the example response body (JSON). If there is no response body (e.g. 204 No Content), type `none`.

## Step 3 — generate artifacts

### 1. Zod model — `src/rest/model/<domain>.model.ts`

Add a JSDoc block above each schema:

```
/**
 * <METHOD> <path>
 * <one-line description>
 *
 * Request body: <RequestClassName>
 *   - <field> (required|optional): <description>
 *
 * Response <status>: <ResponseTypeName>
 *   - <field path> – <description>
 */
```

Map JSON → Zod:
| JSON type | Zod |
|---|---|
| `string` | `z.string()` |
| `number` / `integer` | `z.number()` |
| `boolean` | `z.boolean()` |
| `array` | `z.array(...)` |
| `object` | `z.strictObject({...})` |
| optional field | `.optional()` |
| nullable field | `.nullable()` |

Always use `z.strictObject` instead of `z.object` for all object schemas — this rejects unknown keys and catches API contract drift early.

Export both schema (`XxxSchema`) and inferred type (`type Xxx = z.infer<typeof XxxSchema>`).
If response is `none` — skip the response schema.

### 2. Request body class — `src/rest/<domain>/<domain>.utils.ts`

One class per request body. Required fields first, optional last:

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

Class extends `ApiClient`. Use `RequestOptionsBuilder`:

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

If no response body → omit `.responseType(...)`, return `IApiResponse<null>`.

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

### 5. Test snippet (show only, do not create file)

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

## Conventions

- Zod schemas → `src/rest/model/<domain>.model.ts` only
- Request body classes → `src/rest/<domain>/<domain>.utils.ts` only
- Service classes extend `ApiClient` directly — never wrap it as a constructor argument
- Test data (string/number literals) → `<spec>.data.ts` next to the spec, plain literals only — no `process.env`
- Never inline credentials in test files
