/** Data-driven inputs live next to the test as `*.data.ts`. */
export interface LoginData {
  title: string
  email: string
  password: string
  expectedUrl: RegExp
}

export const loginCases: LoginData[] = [
  {
    title: 'valid user lands on dashboard',
    email: process.env.TEST_USER ?? 'user@example.com',
    password: process.env.TEST_PASSWORD ?? 'changeme',
    expectedUrl: /dashboard/,
  },
]
