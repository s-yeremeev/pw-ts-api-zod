import http from "k6/http"
import { check, sleep } from "k6"
import { Options } from "k6/options"
import { endpoints, buildActivityPayload } from "./shared/endpoints.ts"
import { isValidActivity } from "./shared/validators.ts"

export const options: Options = {
  vus: 5,
  duration: "10s",
  thresholds: {
    http_req_duration: ["p(95)<800"],
    http_req_failed: ["rate<0.01"],
  },
}

export default function () {
  const payload = buildActivityPayload({ title: `VU-${__VU}-iter-${__ITER}` })

  const res = http.post(endpoints.activities, JSON.stringify(payload), {
    headers: { "Content-Type": "application/json" },
  })

  const ok = check(res, {
    "status is 200": (r) => r.status === 200,
    "response matches activity shape": (r) => isValidActivity(r.json()),
  })

  if (!ok) {
    console.log("FAILED response body:", res.body)
  }

  sleep(1)
}
