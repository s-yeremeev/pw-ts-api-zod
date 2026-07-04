export const BASE_URL = __ENV.BASE_URL || __ENV.API_BASE_URL || "https://fakerestapi.azurewebsites.net";

export const endpoints = {
  activities: `${BASE_URL}/api/v1/Activities`,
};

export function buildActivityPayload(overrides: Record<string, unknown> = {}) {
  return {
    id: 0,
    title: "Load test activity",
    dueDate: new Date().toISOString(),
    completed: false,
    ...overrides,
  };
}
