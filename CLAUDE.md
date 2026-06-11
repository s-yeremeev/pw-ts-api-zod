# CLAUDE.md — new-pw-ts-project

Playwright + TypeScript E2E/API test automation for **&lt;SYSTEM_NAME&gt;**.
Scaffolded from the _Project Blueprint — Playwright + TS Framework_.

## Stack

- Playwright `^1.58`, TypeScript `^5.9` (ES2024, `strict: false`, path aliases `@pages/@tests/@rest/@utils`)
- pnpm · ESLint 9 flat (sonarjs/unicorn/playwright/prettier) · Prettier (no semi, single quotes, printWidth 155)
- Zod for API DTOs · CI: GitLab (lint + tsc) + Jenkins (Docker)

## Architecture patterns

- **POM:** all pages extend `UniversalPage`. Locators go through helper methods (`byRole`/`byLabel`/`byTestId`) — never raw `page.locator()` in specs.
- **Service layer** (`src/pages/service/`): reusable business logic shared across pages.
- **Manager pattern:** aggregate page objects for multi-step flows.
- **Fixtures (DI):** `base-test.ts` merges `ui-fixtures.ts` (UI) + `api-fixtures.ts` (API). Import `test`/`expect` from `@tests/base-test`.
- **Data-driven:** inputs in `*.data.ts` next to the spec.
- **REST:** `ApiClient.send<T>()` with Zod-validated DTOs in `src/rest/model/`. Requests are built with `RequestOptionsBuilder` (builder pattern). API service classes extend `ApiClient` directly.

### REST layer structure

```
src/rest/
  api-client.ts          — base class; send<T>(ApiRequestOptions): IApiResponse<T>
  api-response.ts        — IApiResponse<T> { status, body }
  request-options.ts     — RequestOptionsBuilder + ApiRequestOptions interface
  enum/http-method.ts    — EHttpMethod enum (GET | POST | PUT | PATCH | DELETE)
  model/*.model.ts       — Zod schemas + inferred TS types (DTOs)
  auth/
    auth.api.ts          — AuthApi extends ApiClient
    auth.utils.ts        — request body classes (AuthorizeRequest, RefreshTokenRequest)
```

### How to add a new API endpoint

1. **Model** — add a Zod schema to `src/rest/model/<domain>.model.ts`:

   ```ts
   export const MyResponseSchema = z.object({ id: z.number(), name: z.string() })
   export type MyResponse = z.infer<typeof MyResponseSchema>
   ```

2. **Request body class** — add to `src/rest/<domain>/<domain>.utils.ts`:

   ```ts
   export class CreateItemRequest {
     constructor(public readonly name: string) {}
   }
   ```

3. **Service class** — add a method to `src/rest/<domain>/<domain>.api.ts` (extends `ApiClient`):

   ```ts
   async createItem(requestBody: CreateItemRequest): Promise<IApiResponse<MyResponse>> {
     return this.send<MyResponse>(
       new RequestOptionsBuilder(EHttpMethod.POST, '/api/v2/items')
         .request(requestBody)
         .responseType(MyResponseSchema)
         .expectedStatusCode(201)
         .build(),
     )
   }
   ```

4. **Fixture** — add to `src/tests/api/api-fixtures.ts`:

   ```ts
   myApi: async ({ request }, use) => {
     await use(new MyApi(request, apiBaseUrl))
   },
   ```

5. **Test data** — put string/number literals in `*.data.ts` next to the spec:

   ```ts
   // my-feature.data.ts
   export const itemData = { name: 'Test Item' }
   ```

6. **Test** — use the fixture, never instantiate API classes directly in specs:
   ```ts
   test('t_01_create_item', async ({ myApi }) => {
     const response = await myApi.createItem(new CreateItemRequest(itemData.name))
     expect(response.status).toBe(201)
     expect(response.body?.name).toBe(itemData.name)
   })
   ```

### Builder cheat-sheet

| Method                     | Purpose                                 |
| -------------------------- | --------------------------------------- |
| `.request(body)`           | JSON request body                       |
| `.responseType(ZodSchema)` | Zod schema for response validation      |
| `.expectedStatusCode(n)`   | Assert HTTP status (throws on mismatch) |
| `.headers({ key: value })` | Extra request headers                   |

## SOLID principles

| Principle                     | Rule                                                                                                                                                                                                                                                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **S — Single Responsibility** | Each class/module has one responsibility. Zod schemas live in `src/rest/model/*.model.ts`, NOT in the transport layer. Page objects only interact with the page — assertions (`expect`) belong in specs or a dedicated assertion helper.                                                                                 |
| **O — Open/Closed**           | Classes are open for extension, closed for modification. New page objects extend `UniversalPage` without editing the base class. New API endpoints add a method to the relevant `*Api` class using `RequestOptionsBuilder` — without changing `ApiClient.send()`.                                                        |
| **L — Liskov Substitution**   | Every subclass fully substitutes its parent. `LoginPage` (and any page) can replace `UniversalPage` without breaking behaviour.                                                                                                                                                                                          |
| **I — Interface Segregation** | `ui-fixtures.ts` and `api-fixtures.ts` are separate interfaces (`UiFixtures` / `ApiFixtures`). Do not merge them into one file. Specs that do not need UI should not receive a UI fixture.                                                                                                                               |
| **D — Dependency Inversion**  | Tests depend on abstractions, not concrete classes. All dependencies (page objects, `ApiClient`) are injected via Playwright fixtures (`base-test.ts`). Never `new LoginPage(page)` directly in a spec — only via fixture. Never import `test` directly from `@playwright/test` in specs — only from `@tests/base-test`. |

### Known intentional trade-offs

- `UniversalPage` combines navigation + locators + readiness check — an acceptable trade-off for a minimal POM base class. Extract into mixins as the project grows.
- `healthcheck.test.ts` (`externalservers`) only needs the bare `test` without UI/API fixtures — documented here as a deliberate exception.

## Hard rules

- **Never invent locators** — take them from the page object / live DOM (Playwright MCP), not guesses.
- **Never `waitForTimeout`** — use domain readiness helpers (`waitForPageReady`; extend per app).
- **Credentials are test data** — keep them in `*.data.ts` / `.env`, never inline in specs.
- Don't edit shared files (`base-test.ts`, `ui-fixtures.ts`, `universal-page.ts`) without good reason — they affect every test.
- **Test naming:** `t_NN_snake_case`. Tags: `@healthcheck`, `@sequential`.

## CI — Jenkins + Docker

The `Jenkinsfile` uses `agent { docker { ... } }` (Declarative Pipeline). Jenkins pulls the Playwright image, runs all stages inside the container, and removes it automatically on completion. `--rm` in `args` ensures the container is also removed if the Jenkins agent crashes mid-build.

### Prerequisites on the Jenkins agent machine

Jenkins does **not** install Docker automatically. The following setup is required once per agent:

```bash
# 1. Install Docker Engine (Ubuntu/Debian)
curl -fsSL https://get.docker.com | sh

# 2. Grant the jenkins OS user access to Docker
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

Install the **Docker Pipeline** plugin in Jenkins UI:
`Manage Jenkins → Plugins → Available → "Docker Pipeline"`

This plugin provides the `agent { docker { ... } }` syntax used in `Jenkinsfile`.

### Verify the setup

```bash
# Run as the jenkins OS user on the agent machine
docker run hello-world
```

### Environment variants

| Environment           | Required setup                                          |
| --------------------- | ------------------------------------------------------- |
| Jenkins on Linux VM   | Docker Engine + `Docker Pipeline` plugin                |
| Jenkins in Docker     | Mount `/var/run/docker.sock` into the Jenkins container |
| Jenkins on Kubernetes | `Kubernetes` plugin + DinD or Kaniko                    |

### Common issue

`permission denied while trying to connect to the Docker daemon socket` — fix with `usermod -aG docker jenkins` and restart the Jenkins service.

## Exit criteria for any change

1. `pnpm lint` passes.
2. `pnpm run typecheck` passes.
3. The affected test actually runs: `pnpm test -- <path>`.

## Commands

```bash
pnpm install && pnpm exec playwright install
pnpm test            # all
pnpm run test:e2e    # E2E (depends on setup)
pnpm run test:api    # API
pnpm run lint
pnpm run typecheck
```
