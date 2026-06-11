import { ApiClient } from '../api-client'
import { IApiResponse } from '../api-response'
import { EHttpMethod } from '../enum/http-method'
import { AccessTokenResponse, AccessTokenResponseSchema } from '../model/auth.model'
import { RequestOptionsBuilder } from '../request-options'
import { AuthorizeRequest, RefreshTokenRequest } from './auth.utils'

export class AuthApi extends ApiClient {
  async token(requestBody: AuthorizeRequest): Promise<IApiResponse<AccessTokenResponse>> {
    return this.send<AccessTokenResponse>(
      new RequestOptionsBuilder(EHttpMethod.POST, '/api/v2/auth/token')
        .request(requestBody)
        .responseType(AccessTokenResponseSchema)
        .expectedStatusCode(200)
        .build(),
    )
  }

  async refresh(requestBody: RefreshTokenRequest): Promise<IApiResponse<AccessTokenResponse>> {
    return this.send<AccessTokenResponse>(
      new RequestOptionsBuilder(EHttpMethod.POST, '/api/v2/auth/refresh')
        .request(requestBody)
        .responseType(AccessTokenResponseSchema)
        .expectedStatusCode(200)
        .build(),
    )
  }
}
