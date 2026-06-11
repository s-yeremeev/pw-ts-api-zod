import { ApiClient } from '../api-client'
import { IApiResponse } from '../api-response'
import { EHttpMethod } from '../enum/http-method'
import { ActivitiesResponse, ActivitiesResponseSchema, Activity, ActivitySchema } from '../model/activities.model'
import { RequestOptionsBuilder } from '../request-options'
import { CreateActivityRequest } from './activities.utils'

export class ActivitiesApi extends ApiClient {
  /** GET /api/v1/Activities — retrieve a list of all activities. */
  async getActivities(): Promise<IApiResponse<ActivitiesResponse>> {
    return this.send<ActivitiesResponse>(
      new RequestOptionsBuilder(EHttpMethod.GET, '/api/v1/Activities').responseType(ActivitiesResponseSchema).expectedStatusCode(200).build(),
    )
  }

  /** POST /api/v1/Activities — create a new activity. */
  async createActivity(requestBody: CreateActivityRequest, status?: number): Promise<IApiResponse<Activity>> {
    return this.send<Activity>(
      new RequestOptionsBuilder(EHttpMethod.POST, '/api/v1/Activities')
        .request(requestBody)
        .responseType(ActivitySchema)
        .expectedStatusCode(status ?? 200)
        .build(),
    )
  }
}
