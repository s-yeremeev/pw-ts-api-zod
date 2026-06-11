export interface IApiResponse<T> {
  status: number
  body: T | null
}
