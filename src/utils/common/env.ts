/** Small helpers for reading env vars with sane defaults. */
export function requireEnvironment(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

export function envOr(name: string, fallback: string): string {
  return process.env[name] ?? fallback
}

export function envBool(name: string, fallback = false): boolean {
  const value = process.env[name]
  return value === undefined ? fallback : value === 'true'
}
