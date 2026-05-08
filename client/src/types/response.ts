export interface ApiResponse<T> {
  data: T
  message: string
}

export interface PaginatedResponse<T> {
  data: T[]
  message: string
  meta: {
    total: number
    page: number
    limit: number
  }
}

export interface ErrorResponse {
  error: string
  message: string
  statusCode: number
}
