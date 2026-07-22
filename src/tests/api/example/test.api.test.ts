import { test, expect, APIResponse } from '@playwright/test'

test('tests', async ({ request }) => {
  const response: APIResponse = await request.post('https://dummyjson.com/products/add', {
    data: {
      title: 'iPhone 9',
    },
  })
  expect(response.status()).toBe(201)
  const responseBody = await response.json()
  expect(responseBody).toMatchObject({
    title: 'iPhone 9',
  })
})

test('tests2', async ({ request }) => {
  const response: APIResponse = await request.get('https://dummyjson.com/products', {
    params: {
      limit: '10',
      skip: '10',
      select: 'title',
    },
  })
  // .then((r) => r.json())
  // .then(console.log)
  console.log('response', await response.json())
})
