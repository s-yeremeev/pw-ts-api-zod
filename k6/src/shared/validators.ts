export function isValidActivity(data: unknown): boolean {
  if (typeof data !== "object" || data === null) return false
  const obj = data as Record<string, unknown>
  return (
    typeof obj.id !== "undefined" &&
    typeof obj.title === "string" &&
    typeof obj.completed === "boolean"
  )
}
