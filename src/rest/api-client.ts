import { APIRequestContext } from '@playwright/test'
import { IApiResponse } from './api-response'
import { ApiRequestOptions } from './request-options'

export class ApiClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly baseUrl = '',
  ) {}

  async send<T>(options: ApiRequestOptions): Promise<IApiResponse<T>> {
    const url = `${this.baseUrl}${options.url}`

    const defaultHeaders: Record<string, string> = {
      'Accept-Language': 'en',
      'Content-Type': 'application/json',
    }

    const response = await this.request.fetch(url, {
      method: options.method,
      headers: { ...defaultHeaders, ...options.headers },
      data: options.request ? JSON.stringify(options.request) : undefined,
    })

    if (options.expectedStatusCode !== undefined && response.status() !== options.expectedStatusCode) {
      throw new Error(`Expected status ${options.expectedStatusCode} but got ${response.status()} for ${options.method} ${url}`)
    }

    const contentType = response.headers()['content-type'] ?? ''
    let body: T | null = null

    if (contentType.includes('application/json')) {
      const json = await response.json()
      body = options.responseType ? (options.responseType.parse(json) as T) : (json as T)
    }

    return { status: response.status(), body }
  }
}
