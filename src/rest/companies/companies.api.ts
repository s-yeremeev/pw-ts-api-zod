import { ApiClient } from '../api-client'
import { IApiResponse } from '../api-response'
import { EHttpMethod } from '../enum/http-method'
import { CompanyResponse, CompanyResponseSchema } from '../model/company.model'
import { RequestOptionsBuilder } from '../request-options'

export class CompaniesApi extends ApiClient {
  /** GET /api/v2/companies/{id} — retrieve a company by its ID. */
  async getCompany(id: number, token: string, statusCode?: number): Promise<IApiResponse<CompanyResponse>> {
    return this.send<CompanyResponse>(
      new RequestOptionsBuilder(EHttpMethod.GET, `/api/v2/companies/${id}`)
        .responseType(CompanyResponseSchema)
        .headers({ Authorization: `Bearer ${token}`, 'Accept-Language': 'en' })
        .expectedStatusCode(statusCode ?? 200)
        .build(),
    )
  }
}
