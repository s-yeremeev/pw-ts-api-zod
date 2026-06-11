import { ZodSchema } from 'zod'
import { EHttpMethod } from './enum/http-method'

export interface ApiRequestOptions {
  method: EHttpMethod
  url: string
  request?: unknown
  responseType?: ZodSchema
  headers?: Record<string, string>
  expectedStatusCode?: number
}

export class RequestOptionsBuilder {
  private readonly options: Partial<ApiRequestOptions> = {}

  constructor(
    private readonly method: EHttpMethod,
    private readonly url: string,
  ) {
    this.options.method = method
    this.options.url = url
  }

  request(request: unknown): this {
    this.options.request = request
    return this
  }

  responseType(responseType: ZodSchema): this {
    this.options.responseType = responseType
    return this
  }

  headers(headers: Record<string, string>): this {
    this.options.headers = headers
    return this
  }

  expectedStatusCode(status: number): this {
    this.options.expectedStatusCode = status
    return this
  }

  build(): ApiRequestOptions {
    return {
      method: this.method,
      url: this.url,
      ...this.options,
    } as ApiRequestOptions
  }
}
