import type { PrisonLocation } from '../types/dto/prison-location.dto'
import type { ApiResponse } from '../types/response'
import http from './http'

export const getPrisonLocations = async (): Promise<PrisonLocation[]> => {
  const { data } = await http.get<ApiResponse<PrisonLocation[]>>('/prison-location')
  return data.data
}
