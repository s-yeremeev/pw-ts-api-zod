import http from "k6/http"
import { check, sleep } from "k6"
import { Options } from "k6/options"
import { endpoints } from "../shared/endpoints.ts"

export const options: Options = {
  vus: 10,
  duration: "20s",
  thresholds: {
    http_req_duration: ["p(95)<800"],
    http_req_failed: ["rate<0.01"],
  },
}

// Той самий payload, що й у Playwright-тесті (createActivityRequest),
// але id робимо унікальним на кожну ітерацію, щоб уникнути колізій під навантаженням
function buildCreateActivityRequest(overrides: Record<string, unknown> = {}) {
  return {
    id: Math.floor(Math.random() * 1_000_000),
    title: "Write tests",
    dueDate: "2026-06-11T08:00:00.000Z",
    completed: false,
    ...overrides,
  }
}

export default function () {
  const createActivityRequest = buildCreateActivityRequest()

  const res = http.post(endpoints.activities, JSON.stringify(createActivityRequest), {
    headers: { "Content-Type": "application/json" },
  })

  const body = res.json() as Record<string, unknown> | null

  check(res, {
    "status is 200": (r) => r.status === 200,
    "id matches request": () => body?.id === createActivityRequest.id,
    "title matches request": () => body?.title === createActivityRequest.title,
    "completed matches request": () => body?.completed === createActivityRequest.completed,
  })

  sleep(1)
}
