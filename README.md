# new-pw-ts-project

![Playwright](https://img.shields.io/badge/Playwright-1.58-45ba4b?logo=playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-latest-f69220?logo=pnpm&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-%3E%3D20-339933?logo=node.js&logoColor=white)

End-to-end + API test automation for **&lt;SYSTEM_NAME&gt;**.
Scaffolded from the _Project Blueprint — Playwright + TS Framework_ (based on the eVo autotests setup).

## Stack

- **Playwright** `^1.58` + **TypeScript** `^5.9` (target ES2024, `strict: false`)
- **pnpm** package manager
- **ESLint 9** flat config (`@typescript-eslint` + sonarjs + unicorn + playwright + prettier)
- **Prettier** — no semicolons, single quotes, `printWidth: 155`
- **Zod** for API DTO validation
- CI: **GitLab CI** (lint + `tsc --noEmit` on MR) + **Jenkins** (Docker agent, run + reports)

## Prerequisites

- **Git** ([download](https://git-scm.com/download/win))
- **Node.js** ≥ 20 ([download](https://nodejs.org/))
- **pnpm** — `npm install -g pnpm`

## Getting started

```bash
pnpm install
pnpm exec playwright install
cp .env.example .env   # then fill BASE_URL, TEST_USER, TEST_PASSWORD
```

### Clone on a new machine

The project lives at **[s-yeremeev/pw-ts-api-zod](https://github.com/s-yeremeev/pw-ts-api-zod)**. To set it up on another PC:

```bash
git clone https://github.com/s-yeremeev/pw-ts-api-zod.git
cd pw-ts-api-zod
pnpm install
pnpm exec playwright install
cp .env.example .env   # then fill in real credentials
```

Verify everything works:

```bash
pnpm run typecheck
pnpm run lint
pnpm test
```

> **`.env` is not in Git** — only `.env.example` is committed. After cloning, recreate `.env` from the template and fill in the real values manually (they are not stored in the repo). The same applies to `external-credentials.env` and `email-passwords.env`.

**Authentication for a private repo** — GitHub no longer accepts a password over HTTPS. Use one of:

- **GitHub CLI** — `gh auth login` (simplest), or
- **Personal Access Token** instead of the password ([github.com/settings/tokens](https://github.com/settings/tokens)), or
- **SSH key** — clone via `git@github.com:s-yeremeev/pw-ts-api-zod.git`.

## Running tests

```bash
pnpm test                      # all projects
pnpm run test:e2e              # browser E2E (depends on setup)
pnpm run test:api              # API tests
pnpm run test:sequential       # @sequential tests, 1 worker
pnpm run report                # open HTML report
```

Quality:

```bash
pnpm run lint
pnpm run typecheck
pnpm run format
```

## Playwright projects

| Project      | What it runs                                                 |
| ------------ | ------------------------------------------------------------ |
| `setup`      | `auth-storage-state.setup.ts` — logs in, saves storage state |
| `e2e`        | browser tests (excludes `@sequential`), depends on `setup`   |
| `sequential` | `@sequential` tests, single worker                           |
| `api`        | REST tests (trace off)                                       |

## Structure

```
src/
├── pages/            # Page Object Model (UniversalPage base + feature pages)
├── tests/
│   ├── base-test.ts  # merged UI + API fixtures
│   ├── e2e/          # ui-fixtures.ts + setup + browser specs (*.test.ts / *.data.ts)
│   ├── api/          # api-fixtures.ts + REST specs
├── rest/             # ApiClient + Zod models
└── utils/            # common helpers
```

## Architecture patterns

| Pattern             | Description                                                                                                                                                |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **POM**             | All pages extend `UniversalPage`. Locators exposed via helpers (`byRole` / `byLabel` / `byTestId`).                                                        |
| **Service layer**   | `src/pages/service/` — reusable business logic shared across page objects.                                                                                 |
| **Manager pattern** | Aggregate page objects into a manager class for multi-step flows.                                                                                          |
| **Fixtures (DI)**   | `base-test.ts` merges `ui-fixtures.ts` + `api-fixtures.ts`. Always import `test`/`expect` from `@tests/base-test`, never from `@playwright/test` directly. |
| **Data-driven**     | Test inputs live in `*.data.ts` next to the spec, not inline.                                                                                              |
| **REST / Zod**      | `ApiClient.send<T>()` with Zod-validated DTOs. Requests built with `RequestOptionsBuilder`.                                                                |

## Conventions

- **Locators** go through page-object helpers (`byRole`/`byLabel`/`byTestId`), never raw `page.locator()` in specs.
- **No `waitForTimeout`** — use domain readiness helpers (`waitForPageReady`, extend per app).
- **Test data** lives in `*.data.ts` next to the spec, not inline.
- **Test naming**: `t_NN_snake_case`. Tags: `@sequential`.
- Secrets go in `.env` / `external-credentials.env` / `email-passwords.env` — all gitignored.

## Docker

```bash
docker compose up --build
```

## TODO after scaffolding

- [ ] Set real `BASE_URL` and credentials in `.env`
- [ ] Adapt `LoginPage` selectors and `auth-storage-state.setup.ts` to the real login flow
- [ ] Adjust `Dockerfile` / `Jenkinsfile` Playwright image version to match `@playwright/test`
- [ ] Fill `.vscode/settings.json` `cSpell.language` / `cSpell.words` for your domain
