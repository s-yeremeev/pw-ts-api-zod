# new-pw-ts-project

End-to-end + API test automation for **&lt;SYSTEM_NAME&gt;**.
Scaffolded from the *Project Blueprint — Playwright + TS Framework* (based on the eVo autotests setup).

## Stack

- **Playwright** `^1.58` + **TypeScript** `^5.9` (target ES2024, `strict: false`)
- **pnpm** package manager
- **ESLint 9** flat config (`@typescript-eslint` + sonarjs + unicorn + playwright + prettier)
- **Prettier** — no semicolons, single quotes, `printWidth: 155`
- **Zod** for API DTO validation
- CI: **GitLab CI** (lint + `tsc --noEmit` on MR) + **Jenkins** (Docker agent, run + reports)

## Getting started

```bash
pnpm install
pnpm exec playwright install
cp .env.example .env   # then fill BASE_URL, TEST_USER, TEST_PASSWORD
```

## Running tests

```bash
pnpm test                      # all projects
pnpm run test:e2e              # browser E2E (depends on setup)
pnpm run test:api              # API tests
pnpm run test:sequential       # @sequential tests, 1 worker
pnpm run test:healthcheck      # @healthcheck tagged checks
pnpm run report                # open HTML report
```

Quality:

```bash
pnpm run lint
pnpm run typecheck
pnpm run format
```

## Playwright projects

| Project | What it runs |
|---|---|
| `setup` | `auth-storage-state.setup.ts` — logs in, saves storage state |
| `e2e` | browser tests (excludes `@sequential`), depends on `setup` |
| `sequential` | `@sequential` tests, single worker |
| `api` | REST tests (trace off) |
| `healthcheck` | `@healthcheck` tagged tests |
| `externalservers` | prod / external health checks |

## Structure

```
src/
├── pages/            # Page Object Model (UniversalPage base + feature pages)
├── tests/
│   ├── base-test.ts  # merged UI + API fixtures
│   ├── e2e/          # ui-fixtures.ts + setup + browser specs (*.test.ts / *.data.ts)
│   ├── api/          # api-fixtures.ts + REST specs
│   └── externalservers/  # prod health checks
├── rest/             # ApiClient + Zod models
└── utils/            # common helpers
```

## Conventions

- **Locators** go through page-object helpers (`byRole`/`byLabel`/`byTestId`), never raw `page.locator()` in specs.
- **No `waitForTimeout`** — use domain readiness helpers (`waitForPageReady`, extend per app).
- **Test data** lives in `*.data.ts` next to the spec, not inline.
- **Test naming**: `t_NN_snake_case`. Tags: `@healthcheck`, `@sequential`.
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
